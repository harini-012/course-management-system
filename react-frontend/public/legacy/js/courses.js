//=====================================================
// COURSES
// MOCK API + REACT VERSION
//=====================================================

import {
    patchData,
    clearSessions
} from "./api.js";


//=====================================================
// INITIALIZE COURSES PAGE
//=====================================================

function initializeCoursesPage() {

    //=================================================
    // SEARCH
    //=================================================

    const searchInput =
        document.getElementById(
            "searchCourse"
        );


    if (
        searchInput &&
        searchInput.dataset.initialized !== "true"
    ) {

        searchInput.dataset.initialized =
            "true";


        searchInput.addEventListener(
            "keyup",
            function () {

                const value =
                    this.value
                        .trim()
                        .toLowerCase();


                const cards =
                    document.querySelectorAll(
                        "#courseContainer .card"
                    );


                cards.forEach(
                    card => {

                        const heading =
                            card.querySelector(
                                "h3"
                            );


                        if (!heading) {

                            return;
                        }


                        const title =
                            heading.textContent
                                .toLowerCase();


                        card.style.display =
                            title.includes(value)
                                ? ""
                                : "none";
                    }
                );
            }
        );
    }


    //=================================================
    // LOGOUT
    //=================================================

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (
        logoutBtn &&
        logoutBtn.dataset.initialized !== "true"
    ) {

        logoutBtn.dataset.initialized =
            "true";


        logoutBtn.addEventListener(
            "click",
            logout
        );
    }
}


//=====================================================
// SELECT COURSE
//=====================================================

async function selectCourse(
    courseKey
) {

    try {

        if (!courseKey) {

            return false;
        }


        await patchData(
            "appState",
            "current",
            {
                selectedCourseKey:
                    courseKey
            }
        );


        return true;

    }

    catch (error) {

        console.error(
            "Unable to select course:",
            error
        );


        return false;
    }
}


//=====================================================
// LEGACY VIEW DETAILS SUPPORT
//=====================================================

document.addEventListener(
    "click",
    async function (event) {

        const button =
            event.target.closest(
                ".viewCourseBtn"
            );


        if (!button) {

            return;
        }


        /*
         * React CourseCard already handles <a>.
         */

        if (
            button.tagName
                .toLowerCase() === "a"
        ) {

            return;
        }


        event.preventDefault();


        const courseKey =
            button.dataset.course;


        if (!courseKey) {

            return;
        }


        const saved =
            await selectCourse(
                courseKey
            );


        if (saved) {

            window.location.href =
                "/course-details";
        }
    }
);


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
        initializeCoursesPage,
        {
            once: true
        }
    );

}

else {

    initializeCoursesPage();
}


//=====================================================
// GLOBAL FUNCTIONS
//=====================================================

window.selectCourse =
    selectCourse;

window.logout =
    logout;