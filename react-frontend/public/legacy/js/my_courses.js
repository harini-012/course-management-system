
import {
    getData,
    getById,
    queryData,
    patchData,
    getSession,
    clearSessions
} from "./api.js";

// =============================================
// MY COURSES - STUDENT DASHBOARD
// =============================================

let student = null;
let enrolledCourses = [];
let courses = [];
let progressRecords = [];

// =============================================
// HELPERS
// =============================================

function normalize(value) {
    return String(value ?? "").trim().toLowerCase();
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function isRejected(enrollment) {
    return normalize(enrollment.status) === "rejected";
}

// Rejected enrollments remain visible but do not
// contribute to the Enrolled Courses count.
function getActiveEnrollmentCount() {
    return enrolledCourses.filter(
        enrollment => !isRejected(enrollment)
    ).length;
}

function belongsToStudent(record) {
    if (record.studentId != null && student?.id != null) {
        return String(record.studentId) === String(student.id);
    }

    return normalize(record.studentEmail) ===
        normalize(student?.email);
}

// =============================================
// FIND COURSE
// =============================================

function findCourseForEnrollment(enrollment) {
    const enrollmentIds = [
        enrollment.courseId,
        enrollment.courseKey
    ]
        .filter(value => value != null)
        .map(normalize);

    if (enrollmentIds.length > 0) {
        return courses.find(course => {
            const courseIds = [
                course.id,
                course.courseKey,
                course.key
            ]
                .filter(value => value != null)
                .map(normalize);

            return enrollmentIds.some(id =>
                courseIds.includes(id)
            );
        }) || null;
    }

    const title = normalize(
        enrollment.title ||
        enrollment.course ||
        enrollment.courseTitle
    );

    return courses.find(course =>
        title && normalize(course.title) === title
    ) || null;
}

// =============================================
// FIND PROGRESS
// =============================================

function findProgressForEnrollment(enrollment) {
    const identifiers = [
        enrollment.courseId,
        enrollment.courseKey
    ]
        .filter(value => value != null)
        .map(normalize);

    const matchingRecords = progressRecords.filter(progress => {
        const progressIds = [
            progress.courseId,
            progress.courseKey
        ]
            .filter(value => value != null)
            .map(normalize);

        if (identifiers.length > 0) {
            return identifiers.some(id =>
                progressIds.includes(id)
            );
        }

        const title = normalize(
            enrollment.title ||
            enrollment.course ||
            enrollment.courseTitle
        );

        return title &&
            normalize(progress.courseTitle) === title;
    });

    matchingRecords.sort((a, b) => {
        const aCount = Array.isArray(a.completedVideos)
            ? new Set(a.completedVideos.map(String)).size
            : 0;

        const bCount = Array.isArray(b.completedVideos)
            ? new Set(b.completedVideos.map(String)).size
            : 0;

        if (bCount !== aCount) {
            return bCount - aCount;
        }

        const percentageDifference =
            Number(b.percentage || 0) -
            Number(a.percentage || 0);

        if (percentageDifference !== 0) {
            return percentageDifference;
        }

        if (a.completed !== b.completed) {
            return b.completed === true ? 1 : -1;
        }

        return (
            (new Date(
                b.updatedAt || b.startedAt || 0
            ).getTime() || 0) -
            (new Date(
                a.updatedAt || a.startedAt || 0
            ).getTime() || 0)
        );
    });

    return matchingRecords[0] || null;
}

// =============================================
// INITIALIZE
// =============================================

async function initializeMyCourses() {
    try {
        const session = await getSession();

        if (!session || session.role !== "student") {
            window.location.replace("/login");
            return;
        }

        student = await getById(
            "students",
            session.userId
        );

        if (!student || student.active === false) {
            await clearSessions();
            window.location.replace("/login");
            return;
        }

        const [
            enrollmentData,
            courseData,
            progressData
        ] = await Promise.all([
            queryData("enrollments", {
                studentEmail: student.email
            }),
            getData("courses"),
            queryData("progress", {
                studentEmail: student.email
            })
        ]);

        // Keep rejected and deleted-course enrollment
        // records for display in My Courses.
        enrolledCourses = Array.isArray(enrollmentData)
            ? enrollmentData.filter(belongsToStudent)
            : [];

        courses = Array.isArray(courseData)
            ? courseData
            : [];

        progressRecords = Array.isArray(progressData)
            ? progressData.filter(belongsToStudent)
            : [];

        renderMyCourses();
        initializeLogoutButton();

    } catch (error) {
        console.error("My Courses Error:", error);
    }
}

// =============================================
// RENDER MY COURSES
// =============================================

function renderMyCourses() {
    const container =
        document.getElementById("courseContainer");

    if (!container) return;

    if (enrolledCourses.length === 0) {
        container.innerHTML = `
            <div class="empty">
                <h3>No Courses Enrolled Yet</h3>
                <p>
                    Browse courses and enroll to start learning.
                </p>
                <a href="/courses" class="browse">
                    Browse Courses
                </a>
            </div>
        `;

        updateStatistics(0, 0, 0, 0, 0);

        const activity =
            document.getElementById("activityContainer");

        if (activity) {
            activity.innerHTML = `
                <div class="empty">
                    <h3>No Recent Activity</h3>
                    <p>
                        Start a course to see your learning activity.
                    </p>
                </div>
            `;
        }

        return;
    }

    let html = "";
    let completedCourses = 0;
    let inProgressCourses = 0;
    let totalProgress = 0;
    let totalVideos = 0;
    let watchedVideosCount = 0;
    let rejectedCourses = 0;
    let unavailableCourses = 0;

    enrolledCourses.forEach(enrollment => {
        const course =
            findCourseForEnrollment(enrollment);

        const progressRecord =
            findProgressForEnrollment(enrollment);

        const rejected = isRejected(enrollment);
        const deleted = !course;

        const watchedVideos = Array.isArray(
            progressRecord?.completedVideos
        )
            ? [
                ...new Set(
                    progressRecord.completedVideos.map(String)
                )
            ]
            : [];

        const courseVideos =
            Number(progressRecord?.totalVideos) > 0
                ? Number(progressRecord.totalVideos)
                : Array.isArray(course?.videos)
                    ? course.videos.length
                    : 0;

        const completed =
            progressRecord?.completed === true ||
            enrollment.completed === true ||
            normalize(enrollment.status) === "completed";

        let progress = Math.min(
            100,
            Math.max(
                0,
                Number(progressRecord?.percentage || 0)
            )
        );

        if (completed) {
            progress = 100;
        }

        // Exclude rejected courses from statistics.
        if (rejected) {
            rejectedCourses++;
        } else {
            totalProgress += progress;
            totalVideos += courseVideos;
            watchedVideosCount += watchedVideos.length;

            if (completed || progress === 100) {
                completedCourses++;
            } else if (progress > 0) {
                inProgressCourses++;
            }
        }

        if (deleted) {
            unavailableCourses++;
        }

        let status = "Enrolled";

        if (completed || progress === 100) {
            status = "Completed";
        } else if (progress > 0) {
            status = "In Progress";
        }

        if (rejected) {
            status = "Rejected";
        } else if (deleted) {
            status = "Course Unavailable";
        }

        const title =
            enrollment.title ||
            enrollment.course ||
            enrollment.courseTitle ||
            course?.title ||
            progressRecord?.courseTitle ||
            "Deleted Course";

        const enrollmentId =
            String(enrollment.id ?? "");

        const canLearn = !rejected && !deleted;

        const buttonText =
            completed || progress === 100
                ? "Review Course"
                : progress > 0
                    ? "Continue Learning"
                    : "Start Course";

        let message = "";

        if (rejected) {
            message = `
                <p style="
                    color:#b91c1c;
                    margin-top:12px;
                ">
                    Your enrollment for this course
                    was rejected.
                </p>
            `;
        } else if (deleted) {
            message = `
                <p style="
                    color:#b45309;
                    margin-top:12px;
                ">
                    This course is no longer available.
                    Your previous learning progress
                    is preserved.
                </p>
            `;
        }

        html += `
            <div class="course-card">

                <div class="course-header">
                    <h3>${escapeHTML(title)}</h3>

                    <div class="status">
                        ${escapeHTML(status)}
                    </div>
                </div>

                <div class="course-info">

                    <div class="info-box">
                        <h4>Status</h4>
                        <p>${escapeHTML(status)}</p>
                    </div>

                    <div class="info-box">
                        <h4>Progress</h4>
                        <p>${progress}%</p>
                    </div>

                    <div class="info-box">
                        <h4>Videos</h4>
                        <p>
                            ${watchedVideos.length}/${courseVideos}
                            Watched
                        </p>
                    </div>

                    <div class="info-box">
                        <h4>Materials</h4>
                        <p>
                            ${
                                Array.isArray(course?.materials)
                                    ? course.materials.length
                                    : 0
                            } Available
                        </p>
                    </div>

                </div>

                <div class="progress-title">
                    Learning Progress
                </div>

                <div class="progress">
                    <div
                        class="progress-fill"
                        style="width:${progress}%;"
                    ></div>
                </div>

                <div class="progress-text">
                    ${progress}% Completed
                </div>

                ${message}

                <div class="buttons">

                    <button
                        class="btn start"
                        data-enrollment-id="${escapeHTML(enrollmentId)}"
                        data-action="start"
                        ${canLearn ? "" : "disabled"}
                        style="${
                            canLearn
                                ? ""
                                : "opacity:0.5;cursor:not-allowed;"
                        }"
                    >
                        ${
                            canLearn
                                ? buttonText
                                : rejected
                                    ? "Enrollment Rejected"
                                    : "Course Unavailable"
                        }
                    </button>

                    <button
                        class="btn details"
                        data-enrollment-id="${escapeHTML(enrollmentId)}"
                        data-action="details"
                        ${canLearn ? "" : "disabled"}
                        style="${
                            canLearn
                                ? ""
                                : "opacity:0.5;cursor:not-allowed;"
                        }"
                    >
                        View Details
                    </button>

                </div>

            </div>
        `;
    });

    container.innerHTML = html;

    // Attach events to enabled course buttons.
    container.querySelectorAll("[data-action]").forEach(button => {
        button.addEventListener("click", () => {
            const enrollmentId =
                button.dataset.enrollmentId;

            if (button.dataset.action === "start") {
                startCourse(enrollmentId);
            } else {
                viewCourse(enrollmentId);
            }
        });
    });

    // Rejected courses do not affect overall progress.
    const activeEnrollmentCount =
        getActiveEnrollmentCount();

    const overall = activeEnrollmentCount > 0
        ? Math.round(
            totalProgress / activeEnrollmentCount
        )
        : 0;

    updateStatistics(
        completedCourses,
        inProgressCourses,
        overall,
        watchedVideosCount,
        totalVideos
    );

    // =========================================
    // RECENT ACTIVITY
    // =========================================

    const activity =
        document.getElementById("activityContainer");

    if (activity) {
        activity.innerHTML = `
            <div class="course-card">

                <div class="course-header">
                    <h3>Recent Activity</h3>
                    <div class="status">Overview</div>
                </div>

                <p style="
                    font-size:17px;
                    line-height:30px;
                    color:#555;
                ">
                    Enrolled Courses:
                    <b>${activeEnrollmentCount}</b>

                    <br><br>

                    Completed Courses:
                    <b>${completedCourses}</b>

                    <br><br>

                    Rejected Enrollments:
                    <b>${rejectedCourses}</b>

                    <br><br>

                    Unavailable Courses:
                    <b>${unavailableCourses}</b>

                    <br><br>

                    Videos Watched:
                    <b>${watchedVideosCount}/${totalVideos}</b>

                    <br><br>

                    Overall Progress:
                    <b>${overall}%</b>
                </p>

            </div>
        `;
    }
}

// =============================================
// UPDATE STATISTICS
// =============================================

function updateStatistics(
    completedCourses,
    inProgressCourses,
    overall,
    watchedVideos,
    totalVideos
) {
    const activeEnrollmentCount =
        getActiveEnrollmentCount();

    setText(
        "totalCourses",
        activeEnrollmentCount
    );

    setText(
        "enrolledCount",
        activeEnrollmentCount
    );

    setText(
        "progressCount",
        inProgressCourses
    );

    setText(
        "completedCount",
        completedCourses
    );

    // Keep the existing certificate counter logic.
    setText(
        "certificateCount",
        completedCourses
    );

    setText(
        "lessonCount",
        watchedVideos
    );

    setText(
        "videoCount",
        totalVideos
    );

    const overallProgress =
        document.getElementById("overallProgress");

    if (overallProgress) {
        overallProgress.style.width = `${overall}%`;
    }

    setText(
        "overallProgressText",
        `${overall}% Completed`
    );
}

// =============================================
// FIND ENROLLMENT
// =============================================

function findEnrollment(enrollmentId) {
    return enrolledCourses.find(enrollment =>
        String(enrollment.id) === String(enrollmentId)
    ) || null;
}

// =============================================
// CHECK COURSE ACCESS
// =============================================

function canAccessCourse(enrollment) {
    if (!enrollment) {
        alert("Course enrollment not found.");
        return false;
    }

    if (isRejected(enrollment)) {
        alert("Your enrollment has been rejected.");
        return false;
    }

    if (!findCourseForEnrollment(enrollment)) {
        alert("This course is no longer available.");
        return false;
    }

    return true;
}

// =============================================
// VIEW COURSE
// =============================================

async function viewCourse(enrollmentId) {
    try {
        const enrollment =
            findEnrollment(enrollmentId);

        if (!canAccessCourse(enrollment)) {
            return;
        }

        const course =
            findCourseForEnrollment(enrollment);

        const selectedCourseKey =
            course.courseKey ||
            course.key ||
            course.id;

        if (!selectedCourseKey) {
            alert("Course information not found.");
            return;
        }

        await patchData(
            "appState",
            "current",
            {
                selectedCourseKey
            }
        );

        window.location.href =
            "/course-details";

    } catch (error) {
        console.error("View Course Error:", error);
        alert("Unable to open course details.");
    }
}

// =============================================
// START COURSE
// =============================================

async function startCourse(enrollmentId) {
    try {
        const enrollment =
            findEnrollment(enrollmentId);

        if (!canAccessCourse(enrollment)) {
            return;
        }

        const course =
            findCourseForEnrollment(enrollment);

        const selectedCourseKey =
            course.courseKey ||
            course.key ||
            course.id;

        if (!selectedCourseKey) {
            alert("Course information not found.");
            return;
        }

        await patchData(
            "appState",
            "current",
            {
                selectedCourseKey
            }
        );

        window.location.href =
            "/start-course";

    } catch (error) {
        console.error("Start Course Error:", error);
        alert("Unable to start course.");
    }
}

// =============================================
// LOGOUT
// =============================================

function initializeLogoutButton() {
    const logoutBtn =
        document.getElementById("logoutBtn");

    if (
        !logoutBtn ||
        logoutBtn.dataset.initialized === "true"
    ) {
        return;
    }

    logoutBtn.dataset.initialized = "true";

    logoutBtn.addEventListener(
        "click",
        logout
    );
}

async function logout() {
    try {
        await clearSessions();
    } catch (error) {
        console.error("Logout Error:", error);
    }

    alert("Logged Out Successfully.");

    window.location.replace("/login");
}

// =============================================
// REACT-SAFE INITIALIZATION
// =============================================

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeMyCourses,
        { once: true }
    );
} else {
    initializeMyCourses();
}

// =============================================
// GLOBAL FUNCTIONS
// =============================================

window.startCourse = startCourse;
window.viewCourse = viewCourse;
window.logout = logout;
