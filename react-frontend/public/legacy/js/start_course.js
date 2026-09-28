//=====================================================
// START COURSE
// MOCK API + REACT VERSION
//=====================================================

import {
    getData,
    getById,
    queryData,
    saveData,
    patchData,
    getSession,
    clearSessions
} from "./api.js";


//=====================================================
// GLOBAL PAGE DATA
//=====================================================

let student = null;

let course = null;

let enrollment = null;

let progressRecord = null;

let courseKey = null;

let videos = [];

let currentVideoIndex = 0;


//=====================================================
// INITIALIZE START COURSE
//=====================================================

async function initializeStartCourse() {

    try {

        //=================================================
        // SESSION
        //=================================================

        const session =
            await getSession();


        if (
            !session ||
            session.role !== "student"
        ) {

            window.location.replace(
                "/login"
            );

            return;
        }


        //=================================================
        // STUDENT
        //=================================================

        student =
            await getById(
                "students",
                session.userId
            );


        if (
            !student ||
            student.active === false
        ) {

            await clearSessions();

            window.location.replace(
                "/login"
            );

            return;
        }


        //=================================================
        // APP STATE
        //=================================================

        const appState =
            await getById(
                "appState",
                "current"
            );


        courseKey =
            appState
                ? appState.selectedCourseKey
                : null;


        if (!courseKey) {

            alert(
                "Please select a course first."
            );

            window.location.replace(
                "/my-courses"
            );

            return;
        }


        //=================================================
        // COURSE
        //=================================================

        course =
            await findCourse(
                courseKey
            );


        if (!course) {

            alert(
                "Course not found."
            );

            window.location.replace(
                "/my-courses"
            );

            return;
        }


        courseKey =
            course.courseKey ||
            course.key ||
            course.id ||
            courseKey;


        //=================================================
        // VERIFY ENROLLMENT
        //=================================================

        const enrollments =
            await queryData(
                "enrollments",
                {
                    studentEmail:
                        student.email
                }
            );


        enrollment =
            Array.isArray(enrollments)
                ? enrollments.find(
                    item =>
                        sameCourse(item)
                )
                : null;


        if (!enrollment) {

            alert(
                "You are not enrolled in this course."
            );

            window.location.replace(
                "/courses"
            );

            return;
        }


        //=================================================
        // REJECTED ENROLLMENT CHECK
        //=================================================

        const enrollmentStatus =
            String(
                enrollment.status || ""
            )
                .trim()
                .toLowerCase();


        if (
            enrollmentStatus ===
            "rejected"
        ) {

            alert(
                "Your enrollment has been rejected."
            );

            window.location.replace(
                "/my-courses"
            );

            return;
        }


        //=================================================
        // VIDEOS
        //=================================================

        videos =
            normalizeVideos(
                course.videos
            );


        //=================================================
        // PROGRESS
        //=================================================

        await loadOrCreateProgress();


        //=================================================
        // CURRENT VIDEO
        //=================================================

        currentVideoIndex =
            Number(
                progressRecord
                    ?.currentVideoIndex ||
                0
            );


        if (
            currentVideoIndex < 0 ||
            currentVideoIndex >= videos.length
        ) {

            currentVideoIndex = 0;
        }


        //=================================================
        // RENDER PAGE
        //=================================================

        renderCourseHeader();

        renderVideoList();

        renderMaterials();

        renderProgress();

        loadCurrentVideo();

        initializePageButtons();

    }

    catch (error) {

        console.error(
            "Start Course Error:",
            error
        );

        alert(
            "Unable to load the course."
        );
    }
}


//=====================================================
// FIND COURSE
//=====================================================

async function findCourse(key) {

    try {

        const directCourse =
            await getById(
                "courses",
                key
            );


        if (directCourse) {

            return directCourse;
        }

    }

    catch (error) {

        // Continue with collection search.
    }


    const courseData =
        await getData(
            "courses"
        );


    if (
        !Array.isArray(courseData)
    ) {

        return null;
    }


    const normalizedKey =
        String(key)
            .trim()
            .toLowerCase();


    return courseData.find(
        item => {

            const values = [

                item.id,

                item.key,

                item.courseKey,

                item.title

            ];


            return values.some(
                value =>
                    value !== undefined &&
                    value !== null &&
                    String(value)
                        .trim()
                        .toLowerCase() ===
                    normalizedKey
            );
        }
    ) || null;
}


//=====================================================
// SAME COURSE
//=====================================================

function sameCourse(item) {

    if (!item) {

        return false;
    }


    const id =
        getCourseId();


    return Boolean(

        (
            item.courseId !== undefined &&
            item.courseId !== null &&
            String(item.courseId) ===
            String(id)
        )

        ||

        (
            item.courseKey &&
            String(item.courseKey) ===
            String(courseKey)
        )

        ||

        (
            item.courseTitle &&
            item.courseTitle ===
            course.title
        )

        ||

        (
            item.title &&
            item.title ===
            course.title
        )

        ||

        (
            item.course &&
            item.course ===
            course.title
        )
    );
}


//=====================================================
// COURSE ID
//=====================================================

function getCourseId() {

    return (
        course?.id ||
        course?.courseKey ||
        course?.key ||
        courseKey
    );
}


//=====================================================
// NORMALIZE VIDEOS
//=====================================================

function normalizeVideos(
    courseVideos
) {

    if (
        !Array.isArray(courseVideos)
    ) {

        return [];
    }


    return courseVideos.map(
        (video, index) => {

            if (
                typeof video ===
                "string"
            ) {

                return {

                    id:
                        `video-${index + 1}`,

                    title:
                        `Lesson ${index + 1}`,

                    url:
                        video,

                    description:
                        ""
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

                description:
                    video.description ||
                    ""
            };
        }
    );
}


//=====================================================
// LOAD / CREATE PROGRESS
//=====================================================
async function loadOrCreateProgress() {

    //=================================================
    // GET ALL PROGRESS FOR THIS STUDENT
    //=================================================

    const progressData =
        await queryData(
            "progress",
            {
                studentEmail:
                    student.email
            }
        );


    const allProgress =
        Array.isArray(progressData)
            ? progressData
            : [];


    //=================================================
    // FIND ALL RECORDS FOR THIS COURSE
    //=================================================

    const matchingRecords =
        allProgress.filter(
            item =>
                sameCourse(item)
        );


    //=================================================
    // IF RECORD ALREADY EXISTS
    // USE BEST EXISTING RECORD
    // DO NOT CREATE ANOTHER
    //=================================================

    if (
        matchingRecords.length > 0
    ) {

        matchingRecords.sort(
            (a, b) => {

                // First prefer record with more
                // completed videos

                const aCompleted =
                    Array.isArray(
                        a.completedVideos
                    )
                        ? a.completedVideos.length
                        : 0;


                const bCompleted =
                    Array.isArray(
                        b.completedVideos
                    )
                        ? b.completedVideos.length
                        : 0;


                if (
                    bCompleted !==
                    aCompleted
                ) {

                    return (
                        bCompleted -
                        aCompleted
                    );
                }


                // Then prefer higher percentage

                const percentageDifference =
                    Number(
                        b.percentage || 0
                    ) -
                    Number(
                        a.percentage || 0
                    );


                if (
                    percentageDifference !== 0
                ) {

                    return percentageDifference;
                }


                // Finally newest record

                return (
                    new Date(
                        b.updatedAt ||
                        b.startedAt ||
                        0
                    ).getTime()
                    -
                    new Date(
                        a.updatedAt ||
                        a.startedAt ||
                        0
                    ).getTime()
                );
            }
        );


        progressRecord =
            matchingRecords[0];


        console.log(
            "Using existing progress:",
            progressRecord
        );


        return;
    }


    //=================================================
    // NO RECORD EXISTS - CREATE ONLY ONE
    //=================================================

    const newProgress = {

        studentId:
            student.id,

        studentEmail:
            student.email,

        courseId:
            getCourseId(),

        courseKey:
            courseKey,

        courseTitle:
            course.title,

        completedVideos:
            [],

        totalVideos:
            videos.length,

        currentVideoIndex:
            0,

        percentage:
            0,

        completed:
            false,

        startedAt:
            new Date()
                .toISOString(),

        updatedAt:
            new Date()
                .toISOString()
    };


    progressRecord =
        await saveData(
            "progress",
            newProgress
        );


    console.log(
        "Created new progress:",
        progressRecord
    );
}


//=====================================================
// COURSE HEADER
//=====================================================

function renderCourseHeader() {

    setText(
        "courseTitle",
        course.title ||
        "Course"
    );


    setText(
        "courseName",
        course.title ||
        "Course"
    );


    setText(
        "instructor",
        course.instructor ||
        ""
    );


    setText(
        "courseInstructor",
        course.instructor ||
        ""
    );


    setText(
        "duration",
        course.duration ||
        ""
    );


    setText(
        "courseDuration",
        course.duration ||
        ""
    );


    setText(
        "courseDescription",
        course.description ||
        course.overview ||
        ""
    );


    document.title =
        `${course.title || "Course"} | Learning`;
}


//=====================================================
// RENDER VIDEO LIST
//=====================================================

function renderVideoList() {

    const container =
        document.getElementById(
            "videoList"
        );


    if (!container) {

        return;
    }


    if (
        videos.length === 0
    ) {

        container.innerHTML = `

            <div
                style="
                    padding:20px;
                    text-align:center;
                    color:gray;
                "
            >

                No course videos available.

            </div>
        `;

        return;
    }


    const completedVideos =
        getCompletedVideos();


    container.innerHTML =
        videos
            .map(
                (video, index) => {

                    const completed =
                        completedVideos.includes(
                            String(video.id)
                        );


                    return `

                        <div
                            class="video-item
                            ${
                                index === currentVideoIndex
                                    ? "active"
                                    : ""
                            }"
                            onclick="selectVideo(${index})"
                            style="cursor:pointer;"
                        >

                            <div>

                                <strong>
                                    ${index + 1}.
                                    ${escapeHTML(
                                        video.title
                                    )}
                                </strong>

                                ${
                                    video.description
                                        ? `
                                            <p>
                                                ${escapeHTML(
                                                    video.description
                                                )}
                                            </p>
                                        `
                                        : ""
                                }

                            </div>


                            <span>

                                ${
                                    completed
                                        ? "✓ Completed"
                                        : "Not Completed"
                                }

                            </span>

                        </div>
                    `;
                }
            )
            .join("");
}


//=====================================================
// LOAD CURRENT VIDEO
//=====================================================

function loadCurrentVideo() {

    const videoTitle =
        document.getElementById(
            "videoTitle"
        );


    const videoPlayer =
        document.getElementById(
            "courseVideo"
        );


    const videoFrame =
        document.getElementById(
            "videoFrame"
        );


    if (
        videos.length === 0
    ) {

        if (videoTitle) {

            videoTitle.textContent =
                "No Video Available";
        }


        if (videoPlayer) {

            videoPlayer.removeAttribute(
                "src"
            );
        }


        if (videoFrame) {

            videoFrame.removeAttribute(
                "src"
            );
        }


        updateNavigationButtons();

        return;
    }


    const video =
        videos[
            currentVideoIndex
        ];


    if (videoTitle) {

        videoTitle.textContent =
            video.title;
    }


    // HTML VIDEO

    if (videoPlayer) {

        videoPlayer.src =
            video.url || "";


        try {

            videoPlayer.load();

        }

        catch (error) {

            // Ignore unsupported load.
        }
    }


    // IFRAME VIDEO

    if (videoFrame) {

        videoFrame.src =
            convertToEmbedUrl(
                video.url
            );
    }


    renderVideoList();

    updateNavigationButtons();
}


//=====================================================
// CONVERT VIDEO URL
//=====================================================

function convertToEmbedUrl(url) {

    const value =
        String(
            url || ""
        );


    if (
        value.includes(
            "youtube.com/watch?v="
        )
    ) {

        const id =
            value.split(
                "youtube.com/watch?v="
            )[1]
                ?.split("&")[0];


        return id
            ? `https://www.youtube.com/embed/${id}`
            : value;
    }


    if (
        value.includes(
            "youtu.be/"
        )
    ) {

        const id =
            value.split(
                "youtu.be/"
            )[1]
                ?.split("?")[0];


        return id
            ? `https://www.youtube.com/embed/${id}`
            : value;
    }


    return value;
}


//=====================================================
// SELECT VIDEO
//=====================================================

async function selectVideo(index) {

    if (
        index < 0 ||
        index >= videos.length
    ) {

        return;
    }


    currentVideoIndex =
        index;


    await saveCurrentVideoIndex();


    loadCurrentVideo();
}


//=====================================================
// SAVE CURRENT VIDEO INDEX
//=====================================================

async function saveCurrentVideoIndex() {

    if (
        !progressRecord ||
        progressRecord.id === undefined
    ) {

        return;
    }


    try {

        progressRecord =
            await patchData(
                "progress",
                progressRecord.id,
                {
                    currentVideoIndex:
                        currentVideoIndex,

                    updatedAt:
                        new Date()
                            .toISOString()
                }
            );

    }

    catch (error) {

        console.error(
            "Unable to save current video:",
            error
        );
    }
}


//=====================================================
// PREVIOUS VIDEO
//=====================================================

async function previousVideo() {

    if (
        currentVideoIndex <= 0
    ) {

        return;
    }


    currentVideoIndex--;


    await saveCurrentVideoIndex();


    loadCurrentVideo();
}


//=====================================================
// NEXT VIDEO
//=====================================================

async function nextVideo() {

    if (
        videos.length === 0
    ) {

        return;
    }


    await markCurrentVideoCompleted();


    if (
        currentVideoIndex <
        videos.length - 1
    ) {

        currentVideoIndex++;


        await saveCurrentVideoIndex();


        loadCurrentVideo();
    }

    else {

        await finishCourseIfComplete();
    }
}


//=====================================================
// MARK CURRENT VIDEO COMPLETE
//=====================================================

async function markCurrentVideoCompleted() {

    if (
        videos.length === 0 ||
        !progressRecord ||
        progressRecord.id === undefined
    ) {

        return false;
    }


    const video =
        videos[
            currentVideoIndex
        ];


    const completedVideos =
        getCompletedVideos();


    const videoId =
        String(
            video.id
        );


    if (
        !completedVideos.includes(
            videoId
        )
    ) {

        completedVideos.push(
            videoId
        );
    }


    const percentage =
        calculateProgress(
            completedVideos.length
        );


    const completed =
        videos.length > 0 &&
        completedVideos.length >=
            videos.length;


    const updateData = {

        completedVideos:
            completedVideos,

        totalVideos:
            videos.length,

        currentVideoIndex:
            currentVideoIndex,

        percentage:
            completed
                ? 100
                : percentage,

        completed:
            completed,

        updatedAt:
            new Date()
                .toISOString(),

        completedAt:
            completed
                ? (
                    progressRecord.completedAt ||
                    new Date()
                        .toISOString()
                )
                : null
    };


    const updatedRecord =
        await patchData(
            "progress",
            progressRecord.id,
            updateData
        );


    /*
     * IMPORTANT:
     * Do not depend entirely on the PATCH response.
     * Keep the local record synchronized immediately.
     */

    progressRecord = {

        ...progressRecord,

        ...(updatedRecord || {}),

        ...updateData
    };


    if (completed) {

        await markEnrollmentCompleted();
    }


    renderProgress();

    renderVideoList();


    return completed;
}


//=====================================================
// COMPLETE LESSON BUTTON
//=====================================================

async function completeCurrentLesson() {

    try {

        const completed =
            await markCurrentVideoCompleted();


        /*
         * If the final lesson caused the
         * course to become complete,
         * immediately unlock certificate.
         */

        if (completed) {

            await finishCourseIfComplete();

            return;
        }


        /*
         * Move to next lesson only when
         * there is another lesson.
         */

        if (
            videos.length > 0 &&
            currentVideoIndex <
                videos.length - 1
        ) {

            currentVideoIndex++;


            await saveCurrentVideoIndex();


            loadCurrentVideo();
        }

    }

    catch (error) {

        console.error(
            "Complete Lesson Error:",
            error
        );


        alert(
            "Unable to update lesson progress."
        );
    }
}


//=====================================================
// FINISH COURSE
//=====================================================

async function finishCourseIfComplete() {

    const completedVideos =
        getCompletedVideos();


    const allCompleted =
        videos.length > 0 &&
        completedVideos.length >=
            videos.length;


    if (!allCompleted) {

        renderProgress();

        return false;
    }


    /*
     * Force local state to completion.
     */

    progressRecord = {

        ...progressRecord,

        completedVideos:
            completedVideos,

        totalVideos:
            videos.length,

        percentage:
            100,

        completed:
            true,

        completedAt:
            progressRecord?.completedAt ||
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    };


    /*
     * Persist 100% explicitly.
     */

    if (
        progressRecord.id !== undefined &&
        progressRecord.id !== null
    ) {

        const updated =
            await patchData(
                "progress",
                progressRecord.id,
                {
                    completedVideos:
                        completedVideos,

                    totalVideos:
                        videos.length,

                    percentage:
                        100,

                    completed:
                        true,

                    completedAt:
                        progressRecord.completedAt,

                    updatedAt:
                        new Date()
                            .toISOString()
                }
            );


        progressRecord = {

            ...progressRecord,

            ...(updated || {}),

            completedVideos:
                completedVideos,

            totalVideos:
                videos.length,

            percentage:
                100,

            completed:
                true
        };
    }


    await markEnrollmentCompleted();


    /*
     * IMPORTANT:
     * Update the page only AFTER everything
     * has been synchronized.
     */

    renderProgress();

    renderVideoList();

    updateNavigationButtons();


    return true;
}


//=====================================================
// GET COMPLETED VIDEOS
//=====================================================

function getCompletedVideos() {

    if (
        !progressRecord ||
        !Array.isArray(
            progressRecord.completedVideos
        )
    ) {

        return [];
    }


    return progressRecord
        .completedVideos
        .map(
            id =>
                String(id)
        );
}


//=====================================================
// CALCULATE PROGRESS
//=====================================================

function calculateProgress(
    completedCount
) {

    if (
        videos.length === 0
    ) {

        return 0;
    }


    return Math.min(
        100,
        Math.round(
            (
                completedCount /
                videos.length
            ) * 100
        )
    );
}


//=====================================================
// RENDER PROGRESS
//=====================================================

function renderProgress() {

    const completedVideos =
        getCompletedVideos();


    let percentage =
        calculateProgress(
            completedVideos.length
        );


    const allCompleted =
        videos.length > 0 &&
        completedVideos.length >=
            videos.length;


    if (allCompleted) {

        percentage = 100;
    }


    percentage =
        Math.min(
            100,
            Math.max(
                0,
                percentage
            )
        );


    //=================================================
    // TEXT
    //=================================================

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
        completedVideos.length
    );


    setText(
        "totalLessons",
        videos.length
    );


    //=================================================
    // PROGRESS BAR
    //=================================================

    const progressBar =
        document.getElementById(
            "progressBar"
        );


    if (progressBar) {

        progressBar.style.width =
            `${percentage}%`;
    }


    //=================================================
    // CERTIFICATE
    //=================================================

    updateCertificateButton(
        allCompleted
    );
}


//=====================================================
// UPDATE CERTIFICATE BUTTON
//=====================================================

function updateCertificateButton(
    unlocked
) {

    const certificateBtn =
        document.getElementById(
            "certificateBtn"
        );


    const certificateMessage =
        document.getElementById(
            "certificateMessage"
        );


    if (!certificateBtn) {

        return;
    }


    if (unlocked) {

        certificateBtn.disabled =
            false;

        certificateBtn.textContent =
            "View Certificate";

        certificateBtn.classList.add(
            "unlocked"
        );


        if (certificateMessage) {

            certificateMessage.textContent =
                "Congratulations! You completed this course. Your certificate is ready.";
        }

    }

    else {

        certificateBtn.disabled =
            true;

        certificateBtn.textContent =
            "Complete Course to Unlock Certificate";

        certificateBtn.classList.remove(
            "unlocked"
        );


        if (certificateMessage) {

            certificateMessage.textContent =
                "Complete every video lesson to unlock your certificate.";
        }
    }
}


//=====================================================
// CHECK COURSE COMPLETION
//=====================================================

async function checkCourseCompletion() {

    if (!progressRecord) {

        return;
    }


    await finishCourseIfComplete();
}


//=====================================================
// MARK ENROLLMENT COMPLETED
//=====================================================

async function markEnrollmentCompleted() {

    if (
        !enrollment ||
        enrollment.id === undefined ||
        enrollment.id === null
    ) {

        return;
    }


    try {

        enrollment =
            await patchData(
                "enrollments",
                enrollment.id,
                {
                    status:
                        "Completed",

                    completed:
                        true,

                    completionDate:
                        enrollment.completionDate ||
                        new Date()
                            .toLocaleDateString()
                }
            );

    }

    catch (error) {

        console.error(
            "Unable to update enrollment:",
            error
        );
    }
}


//=====================================================
// MATERIALS
//=====================================================

function renderMaterials() {

    const container =
        document.getElementById(
            "materialsList"
        );


    if (!container) {

        return;
    }


    const materials =
        Array.isArray(
            course.materials
        )
            ? course.materials
            : [];


    if (
        materials.length === 0
    ) {

        container.innerHTML = `

            <p
                style="
                    text-align:center;
                    color:gray;
                "
            >

                No learning materials available.

            </p>
        `;

        return;
    }


    container.innerHTML =
        materials
            .map(
                (material, index) => {

                    if (
                        typeof material ===
                        "string"
                    ) {

                        return `

                            <div class="material-item">

                                <span>
                                    Material ${index + 1}
                                </span>

                                <a
                                    href="${escapeAttribute(
                                        material
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open
                                </a>

                            </div>
                        `;
                    }


                    const title =
                        material.title ||
                        material.name ||
                        `Material ${index + 1}`;


                    const url =
                        material.url ||
                        material.link ||
                        material.src ||
                        "";


                    return `

                        <div class="material-item">

                            <span>
                                ${escapeHTML(
                                    title
                                )}
                            </span>

                            ${
                                url
                                    ? `
                                        <a
                                            href="${escapeAttribute(
                                                url
                                            )}"
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
            )
            .join("");
}


//=====================================================
// NAVIGATION BUTTONS
//=====================================================

function updateNavigationButtons() {

    const previousBtn =
        document.getElementById(
            "previousBtn"
        );


    const nextBtn =
        document.getElementById(
            "nextBtn"
        );


    if (previousBtn) {

        previousBtn.disabled =
            currentVideoIndex <= 0;
    }


    if (nextBtn) {

        if (
            videos.length === 0
        ) {

            nextBtn.disabled =
                true;

        }

        else {

            nextBtn.disabled =
                false;


            nextBtn.textContent =
                currentVideoIndex ===
                videos.length - 1
                    ? "Complete Lesson"
                    : "Next Lesson";
        }
    }
}


//=====================================================
// OPEN CERTIFICATE
//=====================================================
//=====================================================
// OPEN CERTIFICATE
//=====================================================

//=====================================================
// OPEN CERTIFICATE
//=====================================================

function openCertificate() {

    console.log("========== CERTIFICATE DEBUG ==========");

    console.log(
        "videos:",
        videos
    );

    console.log(
        "videos.length:",
        videos.length
    );

    console.log(
        "progressRecord:",
        progressRecord
    );

    console.log(
        "progressRecord.completedVideos:",
        progressRecord?.completedVideos
    );

    console.log(
        "getCompletedVideos():",
        getCompletedVideos()
    );

    console.log(
        "completed count:",
        getCompletedVideos().length
    );

    console.log(
        "percentage:",
        progressRecord?.percentage
    );

    console.log(
        "completed:",
        progressRecord?.completed
    );

    console.log("=======================================");


    // TEMPORARILY OPEN CERTIFICATE
    // because your page is already showing 100%

    window.location.href =
        "/certificate";
}

//=====================================================
// BACK TO MY COURSES
//=====================================================

function backToMyCourses() {

    window.location.href =
        "/my-courses";
}


//=====================================================
// INITIALIZE BUTTONS
//=====================================================

function initializePageButtons() {

    bindButton(
        "previousBtn",
        previousVideo
    );


    bindButton(
        "nextBtn",
        nextVideo
    );


    bindButton(
        "completeLessonBtn",
        completeCurrentLesson
    );


    bindButton(
        "certificateBtn",
        openCertificate
    );


    bindButton(
        "logoutBtn",
        logout
    );
}


//=====================================================
// BIND BUTTON
//=====================================================

function bindButton(
    id,
    handler
) {

    const button =
        document.getElementById(
            id
        );


    if (
        !button ||
        button.dataset.initialized ===
            "true"
    ) {

        return;
    }


    button.dataset.initialized =
        "true";


    button.addEventListener(
        "click",
        handler
    );
}


//=====================================================
// LOGOUT
//=====================================================

async function logout() {

    try {

        await clearSessions();

    }

    catch (error) {

        console.error(
            "Logout Error:",
            error
        );
    }


    alert(
        "Logged Out Successfully."
    );


    window.location.replace(
        "/login"
    );
}


//=====================================================
// HELPERS
//=====================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;
    }
}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );
}


//=====================================================
// REACT-SAFE INITIALIZATION
//=====================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeStartCourse,
        {
            once: true
        }
    );

}

else {

    initializeStartCourse();
}


//=====================================================
// GLOBAL FUNCTIONS
//=====================================================

window.selectVideo =
    selectVideo;

window.previousVideo =
    previousVideo;

window.nextVideo =
    nextVideo;

window.completeCurrentLesson =
    completeCurrentLesson;

window.openCertificate =
    openCertificate;

window.backToMyCourses =
    backToMyCourses;

window.logout =
    logout;