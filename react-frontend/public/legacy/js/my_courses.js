//=====================================================
// MY COURSES
// MOCK API + REACT VERSION
//=====================================================

import {
    getData,
    getById,
    queryData,
    patchData,
    getSession,
    clearSessions
} from "./api.js";


let student = null;

let enrolledCourses = [];

let courses = [];

let progressRecords = [];


//=====================================================
// INITIALIZE
//=====================================================

async function initializeMyCourses() {

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
        // LOAD DATA
        //=================================================

        const [
            enrollmentData,
            courseData,
            progressData
        ] =
            await Promise.all([

                queryData(
                    "enrollments",
                    {
                        studentEmail:
                            student.email
                    }
                ),

                getData(
                    "courses"
                ),

                queryData(
                    "progress",
                    {
                        studentEmail:
                            student.email
                    }
                )

            ]);


        enrolledCourses =
            Array.isArray(
                enrollmentData
            )
                ? enrollmentData
                : [];


        courses =
            Array.isArray(
                courseData
            )
                ? courseData
                : [];


        progressRecords =
            Array.isArray(
                progressData
            )
                ? progressData
                : [];


        renderMyCourses();


        initializeLogoutButton();

    }

    catch (error) {

        console.error(
            "My Courses Error:",
            error
        );
    }
}


//=====================================================
// FIND COURSE
//=====================================================

function findCourseForEnrollment(
    enrollment
) {

    return courses.find(
        course =>

            (
                enrollment.courseId !== undefined &&
                String(course.id) ===
                String(enrollment.courseId)
            )

            ||

            (
                enrollment.courseKey &&
                (
                    String(course.courseKey) ===
                        String(enrollment.courseKey)

                    ||

                    String(course.key) ===
                        String(enrollment.courseKey)

                    ||

                    String(course.id) ===
                        String(enrollment.courseKey)
                )
            )

            ||

            (
                enrollment.title &&
                course.title ===
                    enrollment.title
            )

            ||

            (
                enrollment.course &&
                course.title ===
                    enrollment.course
            )

    ) || null;
}


//=====================================================
// FIND PROGRESS
//=====================================================

function findProgressForEnrollment(
    enrollment
) {

    const matchingRecords =
        progressRecords.filter(
            progress =>

                (
                    enrollment.courseId !== undefined &&
                    progress.courseId !== undefined &&
                    String(
                        progress.courseId
                    ) ===
                    String(
                        enrollment.courseId
                    )
                )

                ||

                (
                    enrollment.courseKey &&
                    progress.courseKey &&
                    String(
                        progress.courseKey
                    ) ===
                    String(
                        enrollment.courseKey
                    )
                )

                ||

                (
                    progress.courseTitle &&
                    (
                        progress.courseTitle ===
                            enrollment.title

                        ||

                        progress.courseTitle ===
                            enrollment.course
                    )
                )
        );


    if (
        matchingRecords.length === 0
    ) {

        return null;
    }


    //=================================================
    // CHOOSE BEST PROGRESS RECORD
    //=================================================

    matchingRecords.sort(
        (a, b) => {

            const aVideos =
                Array.isArray(
                    a.completedVideos
                )
                    ? a.completedVideos.length
                    : 0;


            const bVideos =
                Array.isArray(
                    b.completedVideos
                )
                    ? b.completedVideos.length
                    : 0;


            if (
                bVideos !== aVideos
            ) {

                return (
                    bVideos -
                    aVideos
                );
            }


            const aPercentage =
                Number(
                    a.percentage || 0
                );


            const bPercentage =
                Number(
                    b.percentage || 0
                );


            if (
                bPercentage !==
                aPercentage
            ) {

                return (
                    bPercentage -
                    aPercentage
                );
            }


            if (
                b.completed === true &&
                a.completed !== true
            ) {

                return 1;
            }


            if (
                a.completed === true &&
                b.completed !== true
            ) {

                return -1;
            }


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


    return matchingRecords[0];
}


//=====================================================
// RENDER
//=====================================================

function renderMyCourses() {

    const container =
        document.getElementById(
            "courseContainer"
        );


    if (!container) {

        return;
    }


    //=================================================
    // EMPTY
    //=================================================

    if (
        enrolledCourses.length === 0
    ) {

        container.innerHTML = `

            <div class="empty">

                <h3>
                    No Courses Enrolled Yet
                </h3>

                <p>
                    Browse courses and enroll
                    to start learning.
                </p>

                <a
                    href="/courses"
                    class="browse"
                >
                    Browse Courses
                </a>

            </div>
        `;


        updateStatistics(
            0,
            0,
            0,
            0,
            0
        );


        const activityContainer =
            document.getElementById(
                "activityContainer"
            );


        if (activityContainer) {

            activityContainer.innerHTML = `

                <div class="empty">

                    <h3>
                        No Recent Activity
                    </h3>

                    <p>
                        Start a course to see
                        your learning activity.
                    </p>

                </div>
            `;
        }


        return;
    }


    let html =
        "";


    let completedCourses =
        0;


    let inProgressCourses =
        0;


    let totalProgress =
        0;


    let totalVideos =
        0;


    let watchedVideosCount =
        0;


    //=================================================
    // COURSE CARDS
    //=================================================

    enrolledCourses.forEach(
        enrollment => {

            const course =
                findCourseForEnrollment(
                    enrollment
                );


            const progressRecord =
                findProgressForEnrollment(
                    enrollment
                );


            const progress =
                Math.min(
                    100,
                    Math.max(
                        0,
                        Number(
                            progressRecord
                                ?.percentage ||
                            0
                        )
                    )
                );


            totalProgress +=
                progress;


            const watchedVideos =
                Array.isArray(
                    progressRecord
                        ?.completedVideos
                )
                    ? progressRecord
                        .completedVideos
                    : [];


            let courseVideos =
                0;


            if (
                Number(
                    progressRecord
                        ?.totalVideos
                ) > 0
            ) {

                courseVideos =
                    Number(
                        progressRecord
                            .totalVideos
                    );

            }

            else if (
                course &&
                Array.isArray(
                    course.videos
                )
            ) {

                courseVideos =
                    course.videos.length;
            }


            watchedVideosCount +=
                watchedVideos.length;


            totalVideos +=
                courseVideos;


            let status =
                "Enrolled";


            if (
                progress > 0 &&
                progress < 100
            ) {

                status =
                    "In Progress";


                inProgressCourses++;
            }


            if (
                progress === 100 ||
                progressRecord
                    ?.completed === true
            ) {

                status =
                    "Completed";


                completedCourses++;
            }


            const title =
                enrollment.title ||
                enrollment.course ||
                course?.title ||
                "Course";


            const enrollmentId =
                String(
                    enrollment.id
                );


            html += `

                <div class="course-card">

                    <div class="course-header">

                        <h3>
                            ${escapeHTML(title)}
                        </h3>

                        <div class="status">
                            ${status}
                        </div>

                    </div>


                    <div class="course-info">

                        <div class="info-box">

                            <h4>
                                Status
                            </h4>

                            <p>
                                ${status}
                            </p>

                        </div>


                        <div class="info-box">

                            <h4>
                                Progress
                            </h4>

                            <p>
                                ${progress}%
                            </p>

                        </div>


                        <div class="info-box">

                            <h4>
                                Videos
                            </h4>

                            <p>

                                ${watchedVideos.length}/${courseVideos}

                                Watched

                            </p>

                        </div>


                        <div class="info-box">

                            <h4>
                                Materials
                            </h4>

                            <p>
                                ${
                                    course &&
                                    Array.isArray(
                                        course.materials
                                    )
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
                        >
                        </div>

                    </div>


                    <div class="progress-text">

                        ${progress}% Completed

                    </div>


                    <div class="buttons">

                        <button
                            class="btn start"
                            onclick="startCourse('${escapeAttribute(
                                enrollmentId
                            )}')"
                        >

                            ${
                                progress === 100
                                    ? "Review Course"
                                    : progress > 0
                                        ? "Continue Learning"
                                        : "Start Course"
                            }

                        </button>


                        <button
                            class="btn details"
                            onclick="viewCourse('${escapeAttribute(
                                enrollmentId
                            )}')"
                        >

                            View Details

                        </button>

                    </div>

                </div>
            `;
        }
    );


    container.innerHTML =
        html;


    //=================================================
    // OVERALL
    //=================================================

    const overall =
        enrolledCourses.length > 0
            ? Math.round(
                totalProgress /
                enrolledCourses.length
            )
            : 0;


    updateStatistics(
        completedCourses,
        inProgressCourses,
        overall,
        watchedVideosCount,
        totalVideos
    );


    //=================================================
    // ACTIVITY
    //=================================================

    const activityContainer =
        document.getElementById(
            "activityContainer"
        );


    if (activityContainer) {

        activityContainer.innerHTML = `

            <div class="course-card">

                <div class="course-header">

                    <h3>
                        Recent Activity
                    </h3>

                    <div class="status">
                        Today
                    </div>

                </div>


                <p
                    style="
                        font-size:17px;
                        line-height:30px;
                        color:#555;
                    "
                >

                    Enrolled Courses :
                    <b>
                        ${enrolledCourses.length}
                    </b>

                    <br><br>

                    Completed Courses :
                    <b>
                        ${completedCourses}
                    </b>

                    <br><br>

                    Videos Watched :
                    <b>
                        ${watchedVideosCount}/${totalVideos}
                    </b>

                    <br><br>

                    Overall Progress :
                    <b>
                        ${overall}%
                    </b>

                </p>

            </div>
        `;
    }
}


//=====================================================
// STATISTICS
//=====================================================

function updateStatistics(
    completedCourses,
    inProgressCourses,
    overall,
    watchedVideos,
    totalVideos
) {

    setText(
        "totalCourses",
        enrolledCourses.length
    );


    setText(
        "enrolledCount",
        enrolledCourses.length
    );


    setText(
        "progressCount",
        inProgressCourses
    );


    setText(
        "completedCount",
        completedCourses
    );


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
        document.getElementById(
            "overallProgress"
        );


    if (overallProgress) {

        overallProgress.style.width =
            `${overall}%`;
    }


    setText(
        "overallProgressText",
        `${overall}% Completed`
    );
}


//=====================================================
// FIND ENROLLMENT
//=====================================================

function findEnrollment(
    enrollmentId
) {

    return enrolledCourses.find(
        enrollment =>
            String(enrollment.id) ===
            String(enrollmentId)
    ) || null;
}


//=====================================================
// VIEW COURSE
//=====================================================

async function viewCourse(
    enrollmentId
) {

    try {

        const enrollment =
            findEnrollment(
                enrollmentId
            );


        if (!enrollment) {

            alert(
                "Course enrollment not found."
            );

            return;
        }


        const course =
            findCourseForEnrollment(
                enrollment
            );


        const selectedCourseKey =
            course
                ? (
                    course.courseKey ||
                    course.key ||
                    course.id
                )
                : (
                    enrollment.courseKey ||
                    enrollment.courseId
                );


        if (!selectedCourseKey) {

            alert(
                "Course information not found."
            );

            return;
        }


        await patchData(
            "appState",
            "current",
            {
                selectedCourseKey:
                    selectedCourseKey
            }
        );


        window.location.href =
            "/course-details";

    }

    catch (error) {

        console.error(
            "View Course Error:",
            error
        );


        alert(
            "Unable to open course details."
        );
    }
}


//=====================================================
// START COURSE
//=====================================================

async function startCourse(
    enrollmentId
) {

    try {

        const enrollment =
            findEnrollment(
                enrollmentId
            );


        if (!enrollment) {

            alert(
                "Course enrollment not found."
            );

            return;
        }


        const course =
            findCourseForEnrollment(
                enrollment
            );


        const selectedCourseKey =
            course
                ? (
                    course.courseKey ||
                    course.key ||
                    course.id
                )
                : (
                    enrollment.courseKey ||
                    enrollment.courseId
                );


        if (!selectedCourseKey) {

            alert(
                "Course information not found."
            );

            return;
        }


        await patchData(
            "appState",
            "current",
            {
                selectedCourseKey:
                    selectedCourseKey
            }
        );


        window.location.href =
            "/start-course";

    }

    catch (error) {

        console.error(
            "Start Course Error:",
            error
        );


        alert(
            "Unable to start course."
        );
    }
}


//=====================================================
// LOGOUT BUTTON
//=====================================================

function initializeLogoutButton() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (
        !logoutBtn ||
        logoutBtn.dataset.initialized === "true"
    ) {

        return;
    }


    logoutBtn.dataset.initialized =
        "true";


    logoutBtn.addEventListener(
        "click",
        logout
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
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeMyCourses,
        {
            once: true
        }
    );

}

else {

    initializeMyCourses();
}


//=====================================================
// GLOBAL FUNCTIONS
//=====================================================

window.startCourse =
    startCourse;

window.viewCourse =
    viewCourse;

window.logout =
    logout;