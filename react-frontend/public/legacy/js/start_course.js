
/* =====================================================
   STUDENT COURSE MANAGEMENT SYSTEM
   START COURSE - MONGODB VERSION
   ===================================================== */

import {
  getData,
  getById,
  queryData,
  getSession,
  clearSessions
} from "./api.js";

let student = null;
let course = null;
let enrollment = null;
let progressRecord = null;
let courseKey = null;
let videos = [];
let currentVideoIndex = 0;

// =====================================================
// HELPERS
// =====================================================

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value ?? "";
  }
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHTML(value);
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getCourseId() {
  return (
    course?.id ||
    course?.courseKey ||
    course?.key ||
    courseKey
  );
}

function sameCourse(item) {
  if (!item || !course) {
    return false;
  }

  const currentIds = [
    course.id,
    course.courseKey,
    course.key,
    courseKey
  ]
    .filter(value => value != null)
    .map(normalize);

  const recordIds = [
    item.courseId,
    item.courseKey
  ]
    .filter(value => value != null)
    .map(normalize);

  if (recordIds.some(id => currentIds.includes(id))) {
    return true;
  }

  const recordTitle =
    item.courseTitle ||
    item.title ||
    item.course;

  return Boolean(
    recordTitle &&
    normalize(recordTitle) === normalize(course.title)
  );
}

function getCompletedVideos() {
  return [
    ...new Set(
      (
        Array.isArray(progressRecord?.completedVideos)
          ? progressRecord.completedVideos
          : []
      ).map(String)
    )
  ];
}

function calculateProgress(count) {
  if (!videos.length) {
    return 0;
  }

  return Math.min(
    100,
    Math.round((count / videos.length) * 100)
  );
}

function getVideoIds() {
  return videos.map(video => String(video.id));
}

function isCourseCompleted() {
  if (!videos.length) {
    return false;
  }

  const completed = new Set(getCompletedVideos());

  return getVideoIds().every(id => completed.has(id));
}

// =====================================================
// AUTHENTICATED MONGODB PROGRESS API
// =====================================================

async function updateMongoProgress(
  completedVideos = getCompletedVideos(),
  videoIndex = currentVideoIndex
) {
  if (!course || !student) {
    throw new Error("Course or student not loaded");
  }

  const token = sessionStorage.getItem("token");

  if (!token) {
    throw new Error("Login token missing. Please log in again.");
  }

  const response = await fetch(
    "http://localhost:3001/api/v1/progress",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        courseId: getCourseId(),
        completedVideos: [
          ...new Set(completedVideos.map(String))
        ],
        currentVideoIndex: videoIndex
      })
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
      `Unable to update progress (${response.status})`
    );
  }

  if (!result.progress) {
    throw new Error(
      "Backend did not return the updated progress record"
    );
  }

  progressRecord = {
    ...(progressRecord || {}),
    ...result.progress
  };

  return progressRecord;
}

// =====================================================
// FIND COURSE
// =====================================================

async function findCourse(key) {
  try {
    const directCourse = await getById("courses", key);

    if (directCourse) {
      return directCourse;
    }
  } catch (error) {
    console.warn("Direct course lookup failed:", error);
  }

  const courses = await getData("courses");

  if (!Array.isArray(courses)) {
    return null;
  }

  return courses.find(item =>
    [
      item.id,
      item.key,
      item.courseKey,
      item.title
    ].some(value =>
      value != null &&
      normalize(value) === normalize(key)
    )
  ) || null;
}

// =====================================================
// NORMALIZE VIDEOS
// =====================================================

function normalizeVideos(courseVideos) {
  if (!Array.isArray(courseVideos)) {
    return [];
  }

  return courseVideos.map((video, index) => {
    if (typeof video === "string") {
      return {
        id: `video-${index + 1}`,
        title: `Lesson ${index + 1}`,
        url: video,
        description: ""
      };
    }

    return {
      id:
        video.id ||
        video.key ||
        `video-${index + 1}`,

      title:
        video.title ||
        video.name ||
        `Lesson ${index + 1}`,

      url:
        video.url ||
        video.videoUrl ||
        video.src ||
        video.link ||
        "",

      description: video.description || ""
    };
  });
}

// =====================================================
// LOAD EXISTING PROGRESS OR CREATE IT
// =====================================================

async function loadOrCreateProgress() {
  const progressData = await queryData(
    "progress",
    {
      studentEmail: student.email
    }
  );

  const matchingRecords = (
    Array.isArray(progressData) ? progressData : []
  ).filter(sameCourse);

  matchingRecords.sort((a, b) => {
    const aCount = Array.isArray(a.completedVideos)
      ? a.completedVideos.length
      : 0;

    const bCount = Array.isArray(b.completedVideos)
      ? b.completedVideos.length
      : 0;

    if (aCount !== bCount) {
      return bCount - aCount;
    }

    return (
      Number(b.percentage || 0) -
      Number(a.percentage || 0)
    );
  });

  if (matchingRecords.length) {
    progressRecord = matchingRecords[0];

    console.log(
      "Loaded existing MongoDB progress:",
      progressRecord
    );

    return;
  }

  // Create progress through the authenticated backend.
  // The backend will create the record if none exists.
  await updateMongoProgress([], 0);

  console.log(
    "Created MongoDB progress:",
    progressRecord
  );
}

// =====================================================
// INITIALIZE START COURSE PAGE
// =====================================================

async function initializeStartCourse() {
  try {
    const session = await getSession();

    if (
      !session ||
      session.role !== "student"
    ) {
      window.location.replace("/login");
      return;
    }

    student = await getById(
      "students",
      session.userId
    );

    if (!student || student.active === false) {
      await clearSessions();
      sessionStorage.removeItem("token");

      window.location.replace("/login");
      return;
    }

    const appState = await getById(
      "appState",
      "current"
    );

    courseKey = appState?.selectedCourseKey || null;

    if (!courseKey) {
      alert("Please select a course first.");
      window.location.replace("/my-courses");
      return;
    }

    course = await findCourse(courseKey);

    if (!course) {
      alert("Course not found.");
      window.location.replace("/my-courses");
      return;
    }

    courseKey =
      course.courseKey ||
      course.key ||
      course.id ||
      courseKey;

    // Verify enrollment.
    const enrollments = await queryData(
      "enrollments",
      {
        studentEmail: student.email
      }
    );

    enrollment = Array.isArray(enrollments)
      ? enrollments.find(sameCourse)
      : null;

    if (!enrollment) {
      alert("You are not enrolled in this course.");
      window.location.replace("/courses");
      return;
    }

    if (normalize(enrollment.status) === "rejected") {
      alert("Your enrollment has been rejected.");
      window.location.replace("/my-courses");
      return;
    }

    videos = normalizeVideos(course.videos);

    await loadOrCreateProgress();

    currentVideoIndex = Number(
      progressRecord?.currentVideoIndex ?? 0
    );

    if (
      !Number.isInteger(currentVideoIndex) ||
      currentVideoIndex < 0 ||
      currentVideoIndex >= videos.length
    ) {
      currentVideoIndex = 0;
    }

    renderCourseHeader();
    renderVideoList();
    renderMaterials();
    renderProgress();
    loadCurrentVideo();
    initializePageButtons();

  } catch (error) {
    console.error("Start Course Error:", error);

    alert(
      error.message ||
      "Unable to load the course."
    );
  }
}

// =====================================================
// COURSE HEADER
// =====================================================

function renderCourseHeader() {
  setText("courseTitle", course.title || "Course");
  setText("courseName", course.title || "Course");
  setText("instructor", course.instructor || "");
  setText("courseInstructor", course.instructor || "");
  setText("duration", course.duration || "");
  setText("courseDuration", course.duration || "");

  setText(
    "courseDescription",
    course.description || course.overview || ""
  );

  document.title =
    `${course.title || "Course"} | Learning`;
}

// =====================================================
// RENDER VIDEO LIST
// =====================================================

function renderVideoList() {
  const container = document.getElementById("videoList");

  if (!container) {
    return;
  }

  if (!videos.length) {
    container.innerHTML = `
      <div style="padding:20px;text-align:center;color:gray;">
        No course videos available.
      </div>
    `;

    return;
  }

  const completed = new Set(getCompletedVideos());

  container.innerHTML = videos.map((video, index) => `
    <div
      class="video-item ${
        index === currentVideoIndex ? "active" : ""
      }"
      onclick="selectVideo(${index})"
      style="cursor:pointer;"
    >
      <div>
        <strong>
          ${index + 1}. ${escapeHTML(video.title)}
        </strong>

        ${
          video.description
            ? `<p>${escapeHTML(video.description)}</p>`
            : ""
        }
      </div>

      <span>
        ${
          completed.has(String(video.id))
            ? "✓ Completed"
            : "Not Completed"
        }
      </span>
    </div>
  `).join("");
}

// =====================================================
// VIDEO URL CONVERSION
// =====================================================

function convertToEmbedUrl(url) {
  const value = String(url || "");

  if (value.includes("youtube.com/watch?v=")) {
    const id = value
      .split("youtube.com/watch?v=")[1]
      ?.split("&")[0];

    return id
      ? `https://www.youtube.com/embed/${id}`
      : value;
  }

  if (value.includes("youtu.be/")) {
    const id = value
      .split("youtu.be/")[1]
      ?.split("?")[0];

    return id
      ? `https://www.youtube.com/embed/${id}`
      : value;
  }

  return value;
}

// =====================================================
// LOAD CURRENT VIDEO
// =====================================================

function loadCurrentVideo() {
  const videoTitle =
    document.getElementById("videoTitle");

  const videoPlayer =
    document.getElementById("courseVideo");

  const videoFrame =
    document.getElementById("videoFrame");

  if (!videos.length) {
    setText("videoTitle", "No Video Available");

    videoPlayer?.removeAttribute("src");
    videoFrame?.removeAttribute("src");

    updateNavigationButtons();
    return;
  }

  const video = videos[currentVideoIndex];

  if (!video) {
    return;
  }

  if (videoTitle) {
    videoTitle.textContent = video.title;
  }

  if (videoPlayer) {
    videoPlayer.src = video.url || "";

    try {
      videoPlayer.load();
    } catch (error) {
      console.warn("Video load warning:", error);
    }
  }

  if (videoFrame) {
    videoFrame.src = convertToEmbedUrl(video.url);
  }

  renderVideoList();
  updateNavigationButtons();
}

// =====================================================
// SAVE CURRENT VIDEO INDEX
// =====================================================

async function saveCurrentVideoIndex() {
  try {
    await updateMongoProgress(
      getCompletedVideos(),
      currentVideoIndex
    );
  } catch (error) {
    console.error(
      "Unable to save current video:",
      error
    );

    throw error;
  }
}

// =====================================================
// SELECT VIDEO
// =====================================================

async function selectVideo(index) {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= videos.length
  ) {
    return;
  }

  const previousIndex = currentVideoIndex;
  currentVideoIndex = index;

  try {
    await saveCurrentVideoIndex();
    loadCurrentVideo();
  } catch (error) {
    currentVideoIndex = previousIndex;
    alert(error.message || "Unable to select video.");
  }
}

// =====================================================
// PREVIOUS VIDEO
// =====================================================

async function previousVideo() {
  if (currentVideoIndex <= 0) {
    return;
  }

  await selectVideo(currentVideoIndex - 1);
}

// =====================================================
// MARK VIDEO COMPLETED
// =====================================================

async function markCurrentVideoCompleted() {
  if (
    !videos.length ||
    !progressRecord
  ) {
    return false;
  }

  const video = videos[currentVideoIndex];

  if (!video) {
    return false;
  }

  const completedVideos = getCompletedVideos();
  const videoId = String(video.id);

  if (!completedVideos.includes(videoId)) {
    completedVideos.push(videoId);
  }

  // Backend merges existing completed videos,
  // calculates percentage, and marks the
  // enrollment completed when appropriate.
  await updateMongoProgress(
    completedVideos,
    currentVideoIndex
  );

  const completed = isCourseCompleted();

  renderProgress();
  renderVideoList();

  return completed;
}

// =====================================================
// NEXT VIDEO
// =====================================================

async function nextVideo() {
  if (!videos.length) {
    return;
  }

  try {
    const completed =
      await markCurrentVideoCompleted();

    if (completed) {
      await finishCourseIfComplete();
      return;
    }

    if (currentVideoIndex < videos.length - 1) {
      await selectVideo(currentVideoIndex + 1);
    }
  } catch (error) {
    console.error("Next Video Error:", error);
    alert(error.message || "Unable to update progress.");
  }
}

// =====================================================
// COMPLETE CURRENT LESSON
// =====================================================

async function completeCurrentLesson() {
  try {
    const completed =
      await markCurrentVideoCompleted();

    if (completed) {
      await finishCourseIfComplete();
      return;
    }

    if (currentVideoIndex < videos.length - 1) {
      await selectVideo(currentVideoIndex + 1);
    }
  } catch (error) {
    console.error("Complete Lesson Error:", error);

    alert(
      error.message ||
      "Unable to update lesson progress."
    );
  }
}

// =====================================================
// FINISH COURSE
// =====================================================

async function finishCourseIfComplete() {
  if (!isCourseCompleted()) {
    renderProgress();
    return false;
  }

  // Synchronize completion through backend.
  // The backend also updates the enrollment.
  await updateMongoProgress(
    getCompletedVideos(),
    currentVideoIndex
  );

  renderProgress();
  renderVideoList();
  updateNavigationButtons();

  return true;
}

// =====================================================
// RENDER PROGRESS
// =====================================================

function renderProgress() {
  const completedVideos = getCompletedVideos();

  const completedSet = new Set(completedVideos);

  const completedCount = getVideoIds()
    .filter(id => completedSet.has(id))
    .length;

  const percentage = calculateProgress(completedCount);

  setText(
    "progressText",
    `${percentage}% Completed`
  );

  setText(
    "progressPercentage",
    `${percentage}%`
  );

  setText(
    "completedLessons",
    completedCount
  );

  setText(
    "totalLessons",
    videos.length
  );

  const progressBar =
    document.getElementById("progressBar");

  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
  }

  updateCertificateButton(isCourseCompleted());
}

// =====================================================
// CERTIFICATE BUTTON
// =====================================================

function updateCertificateButton(unlocked) {
  const button =
    document.getElementById("certificateBtn");

  const message =
    document.getElementById("certificateMessage");

  if (!button) {
    return;
  }

  if (unlocked) {
    button.disabled = false;
    button.textContent = "View Certificate";
    button.classList.add("unlocked");

    if (message) {
      message.textContent =
        "Congratulations! You completed this course. Your certificate is ready.";
    }
  } else {
    button.disabled = true;

    button.textContent =
      "Complete Course to Unlock Certificate";

    button.classList.remove("unlocked");

    if (message) {
      message.textContent =
        "Complete every video lesson to unlock your certificate.";
    }
  }
}

// =====================================================
// CHECK COURSE COMPLETION
// =====================================================

async function checkCourseCompletion() {
  if (!progressRecord) {
    return;
  }

  await finishCourseIfComplete();
}

// =====================================================
// RENDER MATERIALS
// =====================================================

function renderMaterials() {
  const container =
    document.getElementById("materialsList");

  if (!container) {
    return;
  }

  const materials = Array.isArray(course.materials)
    ? course.materials
    : [];

  if (!materials.length) {
    container.innerHTML = `
      <p style="text-align:center;color:gray;">
        No learning materials available.
      </p>
    `;

    return;
  }

  container.innerHTML = materials.map(
    (material, index) => {
      const title = typeof material === "string"
        ? `Material ${index + 1}`
        : (
          material.title ||
          material.name ||
          `Material ${index + 1}`
        );

      const url = typeof material === "string"
        ? material
        : (
          material.url ||
          material.link ||
          material.src ||
          ""
        );

      return `
        <div class="material-item">
          <span>${escapeHTML(title)}</span>

          ${
            url
              ? `
                <a
                  href="${escapeAttribute(url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open
                </a>
              `
              : ""
          }
        </div>
      `;
    }
  ).join("");
}

// =====================================================
// NAVIGATION BUTTONS
// =====================================================

function updateNavigationButtons() {
  const previousBtn =
    document.getElementById("previousBtn");

  const nextBtn =
    document.getElementById("nextBtn");

  if (previousBtn) {
    previousBtn.disabled =
      currentVideoIndex <= 0;
  }

  if (nextBtn) {
    nextBtn.disabled = videos.length === 0;

    nextBtn.textContent =
      currentVideoIndex === videos.length - 1
        ? "Complete Lesson"
        : "Next Lesson";
  }
}

// =====================================================
// OPEN CERTIFICATE
// =====================================================

function openCertificate() {
  if (!isCourseCompleted()) {
    alert(
      "Complete every video lesson to unlock your certificate."
    );

    return;
  }

  window.location.href = "/certificate";
}

// =====================================================
// BACK TO MY COURSES
// =====================================================

function backToMyCourses() {
  window.location.href = "/my-courses";
}

// =====================================================
// BUTTON INITIALIZATION
// =====================================================

function bindButton(id, handler) {
  const button = document.getElementById(id);

  if (
    !button ||
    button.dataset.initialized === "true"
  ) {
    return;
  }

  button.dataset.initialized = "true";
  button.addEventListener("click", handler);
}

function initializePageButtons() {
  bindButton("previousBtn", previousVideo);
  bindButton("nextBtn", nextVideo);
  bindButton("completeLessonBtn", completeCurrentLesson);
  bindButton("certificateBtn", openCertificate);
  bindButton("logoutBtn", logout);
}

// =====================================================
// LOGOUT
// =====================================================

async function logout() {
  try {
    await clearSessions();
    sessionStorage.removeItem("token");
  } catch (error) {
    console.error("Logout Error:", error);
  }

  alert("Logged Out Successfully.");

  window.location.replace("/login");
}

// =====================================================
// REACT-SAFE INITIALIZATION
// =====================================================

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeStartCourse,
    { once: true }
  );
} else {
  initializeStartCourse();
}

// =====================================================
// GLOBAL FUNCTIONS
// =====================================================

window.selectVideo = selectVideo;
window.previousVideo = previousVideo;
window.nextVideo = nextVideo;
window.completeCurrentLesson = completeCurrentLesson;
window.checkCourseCompletion = checkCourseCompletion;
window.openCertificate = openCertificate;
window.backToMyCourses = backToMyCourses;
window.logout = logout;
