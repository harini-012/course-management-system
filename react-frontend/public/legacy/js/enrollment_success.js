//=====================================================
// ENROLLMENT SUCCESS
// MOCK API + REACT VERSION
//=====================================================

import {
    getById,
    queryData,
    getSession,
    clearSessions
} from "./api.js";


//=====================================================
// INITIALIZE
//=====================================================

async function initializeEnrollmentSuccess() {

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

        const student =
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
        // SELECTED COURSE
        //=================================================

        const appState =
            await getById(
                "appState",
                "current"
            );


        const selectedCourseKey =
            appState
                ? appState.selectedCourseKey
                : null;


        //=================================================
        // STUDENT ENROLLMENTS
        //=================================================

        const enrollments =
            await queryData(
                "enrollments",
                {
                    studentEmail:
                        student.email
                }
            );


        let enrollment =
            null;


        //=================================================
        // CURRENT COURSE
        //=================================================

        if (
            selectedCourseKey &&
            Array.isArray(enrollments)
        ) {

            enrollment =
                enrollments.find(
                    item =>
                        String(
                            item.courseId
                        ) ===
                        String(
                            selectedCourseKey
                        )

                        ||

                        String(
                            item.courseKey
                        ) ===
                        String(
                            selectedCourseKey
                        )
                ) || null;
        }


        //=================================================
        // LATEST FALLBACK
        //=================================================

        if (
            !enrollment &&
            Array.isArray(enrollments) &&
            enrollments.length > 0
        ) {

            enrollment =
                enrollments[
                    enrollments.length - 1
                ];
        }


        //=================================================
        // COURSE NAME
        //=================================================

        const courseNameElement =
            document.getElementById(
                "courseName"
            );


        if (courseNameElement) {

            courseNameElement.textContent =
                enrollment
                    ? (
                        enrollment.title ||
                        enrollment.course ||
                        "Selected Course"
                    )
                    : "Selected Course";
        }


        //=================================================
        // DATE
        //=================================================

        const enrollDateElement =
            document.getElementById(
                "enrollDate"
            );


        if (enrollDateElement) {

            if (
                enrollment &&
                enrollment.enrollDate
            ) {

                enrollDateElement.textContent =
                    enrollment.enrollDate;

            }

            else {

                enrollDateElement.textContent =
                    new Date()
                        .toLocaleDateString(
                            "en-US",
                            {
                                day:
                                    "numeric",

                                month:
                                    "long",

                                year:
                                    "numeric"
                            }
                        );
            }
        }


        //=================================================
        // LOGOUT
        //=================================================

        initializeLogoutButton();

    }

    catch (error) {

        console.error(
            "Enrollment Success Page Error:",
            error
        );
    }
}


//=====================================================
// MY COURSES
//=====================================================

function goToMyCourses() {

    window.location.href =
        "/my-courses";
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
// REACT-SAFE INITIALIZATION
//=====================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeEnrollmentSuccess,
        {
            once: true
        }
    );

}

else {

    initializeEnrollmentSuccess();
}


//=====================================================
// GLOBAL FUNCTIONS
//=====================================================

window.goToMyCourses =
    goToMyCourses;

window.logout =
    logout;