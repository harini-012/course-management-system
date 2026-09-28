//=====================================================
// STUDENT DASHBOARD
// MOCK API + REACT VERSION
//=====================================================

import {
    getById,
    queryData,
    getSession,
    clearSessions
} from "./api.js";


//=====================================================
// DATA
//=====================================================

let student = null;

let enrolledCourses = [];

let progressRecords = [];


//=====================================================
// INITIALIZE DASHBOARD
//=====================================================

async function initializeStudentDashboard() {

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


        if (!student) {

            await clearSessions();


            window.location.replace(
                "/login"
            );

            return;
        }


        if (
            student.active === false
        ) {

            await clearSessions();


            window.location.replace(
                "/login"
            );

            return;
        }


        //=================================================
        // STUDENT DETAILS
        //=================================================

        const studentEmail =
            document.getElementById(
                "studentEmail"
            );


        const studentDepartment =
            document.getElementById(
                "studentDepartment"
            );


        if (studentEmail) {

            studentEmail.textContent =
                student.email || "-";
        }


        if (studentDepartment) {

            studentDepartment.textContent =
                student.department || "-";
        }


        //=================================================
        // ENROLLMENTS
        //=================================================

        const enrollmentData =
            await queryData(
                "enrollments",
                {
                    studentEmail:
                        student.email
                }
            );


        enrolledCourses =
            Array.isArray(
                enrollmentData
            )
                ? enrollmentData
                : [];


        //=================================================
        // PROGRESS
        //=================================================

        const progressData =
            await queryData(
                "progress",
                {
                    studentEmail:
                        student.email
                }
            );


        progressRecords =
            Array.isArray(
                progressData
            )
                ? progressData
                : [];


        renderDashboard();

    }

    catch (error) {

        console.error(
            "Student Dashboard Error:",
            error
        );
    }
}


//=====================================================
// FIND PROGRESS
//=====================================================

function findProgress(
    enrollment
) {

    //=================================================
    // GET ALL MATCHING PROGRESS RECORDS
    //=================================================

    const matchingRecords =
        progressRecords.filter(
            progress =>

                (
                    progress.courseId &&
                    enrollment.courseId &&
                    String(
                        progress.courseId
                    ) ===
                    String(
                        enrollment.courseId
                    )
                )

                ||

                (
                    progress.courseKey &&
                    enrollment.courseKey &&
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
    // SELECT BEST PROGRESS RECORD
    //=================================================

    matchingRecords.sort(
        (a, b) => {

            // Prefer more completed videos

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


            // Prefer higher percentage

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


            // Prefer completed record

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


    return matchingRecords[0];
}

//=====================================================
// RENDER DASHBOARD
//=====================================================

function renderDashboard() {

    const courseTable =
        document.getElementById(
            "courseTable"
        );


    const notificationContainer =
        document.getElementById(
            "notificationContainer"
        );


    const quickOverview =
        document.getElementById(
            "quickOverview"
        );


    let totalProgress =
        0;


    let completedCourses =
        0;


    enrolledCourses.forEach(
        course => {

            const progressRecord =
                findProgress(
                    course
                );


            const progress =
                progressRecord
                    ? Number(
                        progressRecord.percentage ||
                        0
                    )
                    : 0;


            totalProgress +=
                progress;


            if (
                progress === 100 ||
                progressRecord?.completed === true
            ) {

                completedCourses++;
            }
        }
    );


    const overall =
        enrolledCourses.length > 0
            ? Math.round(
                totalProgress /
                enrolledCourses.length
            )
            : 0;


    //=================================================
    // STATISTICS
    //=================================================

    setText(
        "enrolledCount",
        enrolledCourses.length
    );


    setText(
        "completedCount",
        completedCourses
    );


    setText(
        "assignmentCount",
        "0"
    );


    setText(
        "overallProgress",
        overall + "%"
    );


    //=================================================
    // MY COURSES
    //=================================================

    if (courseTable) {

        if (
            enrolledCourses.length === 0
        ) {

            courseTable.innerHTML = `

                <tr>

                    <td
                        colspan="3"
                        style="
                            text-align:center;
                            padding:40px;
                            color:gray;
                        "
                    >

                        No courses enrolled yet.

                    </td>

                </tr>
            `;

        }

        else {

            let html =
                "";


            enrolledCourses.forEach(
                course => {

                    const progressRecord =
                        findProgress(
                            course
                        );


                    const progress =
                        progressRecord
                            ? Number(
                                progressRecord.percentage ||
                                0
                            )
                            : 0;


                    const status =
                        progress === 100 ||
                        progressRecord?.completed === true
                            ? "Completed"
                            : progress > 0
                                ? "In Progress"
                                : "Enrolled";


                    const title =
                        course.title ||
                        course.course ||
                        course.courseTitle ||
                        "Course";


                    html += `

                        <tr>

                            <td>

                                ${escapeHTML(
                                    title
                                )}

                            </td>


                            <td>

                                ${status}

                            </td>


                            <td>

                                ${progress}%

                                <div
                                    style="
                                        width:120px;
                                        height:8px;
                                        background:#E5E7EB;
                                        border-radius:20px;
                                        margin-top:6px;
                                    "
                                >

                                    <div
                                        style="
                                            width:${Math.min(
                                                100,
                                                Math.max(
                                                    0,
                                                    progress
                                                )
                                            )}%;
                                            height:100%;
                                            background:#2563EB;
                                            border-radius:20px;
                                        "
                                    >
                                    </div>

                                </div>

                            </td>

                        </tr>
                    `;
                }
            );


            courseTable.innerHTML =
                html;
        }
    }


    //=================================================
    // NOTIFICATIONS
    //=================================================

    if (notificationContainer) {

        if (
            enrolledCourses.length === 0
        ) {

            notificationContainer.innerHTML = `

                <p
                    style="
                        text-align:center;
                        padding:30px;
                        color:gray;
                    "
                >

                    No notifications available.

                </p>
            `;

        }

        else {

            notificationContainer.innerHTML = `

                <div
                    style="
                        padding:20px;
                        background:#EFF6FF;
                        border-left:5px solid #2563EB;
                        border-radius:8px;
                        margin-bottom:15px;
                    "
                >

                    You have successfully enrolled in

                    <b>
                        ${enrolledCourses.length}
                    </b>

                    course(s).

                </div>


                <div
                    style="
                        padding:20px;
                        background:#F0FDF4;
                        border-left:5px solid #16A34A;
                        border-radius:8px;
                    "
                >

                    You have completed

                    <b>
                        ${completedCourses}
                    </b>

                    course(s).

                    <br><br>

                    Overall Learning Progress :

                    <b>
                        ${overall}%
                    </b>

                </div>
            `;
        }
    }


    //=================================================
    // QUICK OVERVIEW
    //=================================================

    if (quickOverview) {

        quickOverview.innerHTML = `

            <p>

                <b>
                    Total Courses :
                </b>

                ${enrolledCourses.length}

            </p>

            <br>


            <p>

                <b>
                    Completed :
                </b>

                ${completedCourses}

            </p>

            <br>


            <p>

                <b>
                    Assignments :
                </b>

                0

            </p>

            <br>


            <p>

                <b>
                    Overall Progress :
                </b>

                ${overall}%

            </p>


            <div
                style="
                    width:100%;
                    height:12px;
                    background:#E5E7EB;
                    border-radius:20px;
                    margin-top:10px;
                "
            >

                <div
                    style="
                        width:${Math.min(
                            100,
                            Math.max(
                                0,
                                overall
                            )
                        )}%;
                        height:100%;
                        background:#2563EB;
                        border-radius:20px;
                    "
                >
                </div>

            </div>
        `;
    }
}


//=====================================================
// SET TEXT
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


//=====================================================
// ESCAPE HTML
//=====================================================

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
// INITIALIZE LOGOUT BUTTON
//=====================================================

function initializeLogoutButton() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (
        !logoutBtn ||
        logoutBtn.dataset.initialized ===
            "true"
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
// START PAGE
//=====================================================

function startStudentDashboard() {

    initializeLogoutButton();

    initializeStudentDashboard();
}


//=====================================================
// REACT-COMPATIBLE INITIALIZATION
//=====================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startStudentDashboard,
        {
            once: true
        }
    );

}

else {

    startStudentDashboard();
}


//=====================================================
// GLOBAL FUNCTIONS
//=====================================================

window.logout =
    logout;