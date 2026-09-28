//=====================================================
// COURSE DETAILS
// MOCK API + REACT VERSION
//=====================================================

import {
    getById,
    getData,
    queryData,
    saveData,
    patchData,
    getSession,
    clearSessions
} from "./api.js";


let student = null;

let course = null;

let courseKey = null;


//=====================================================
// INITIALIZE
//=====================================================

async function initializeCourseDetails() {

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


        //=================================================
        // URL FALLBACK
        // /courses/:courseKey
        //=================================================

        if (!courseKey) {

            const parts =
                window.location.pathname
                    .split("/")
                    .filter(Boolean);


            if (
                parts.length === 2 &&
                parts[0] === "courses"
            ) {

                courseKey =
                    decodeURIComponent(
                        parts[1]
                    );
            }
        }


        if (!courseKey) {

            window.location.replace(
                "/courses"
            );

            return;
        }


        //=================================================
        // FIND COURSE
        //=================================================

        course =
            await findCourse(
                courseKey
            );


        if (!course) {

            alert(
                "This course is no longer available."
            );


            window.location.replace(
                "/courses"
            );

            return;
        }


        //=================================================
        // KEEP CORRECT COURSE IN APP STATE
        //=================================================

        const stableKey =
            course.courseKey ||
            course.key ||
            course.id ||
            courseKey;


        courseKey =
            stableKey;


        await patchData(
            "appState",
            "current",
            {
                selectedCourseKey:
                    stableKey
            }
        );


        //=================================================
        // DISPLAY
        //=================================================

        renderCourse();


        await checkEnrollment();


        initializeButtons();

    }

    catch (error) {

        console.error(
            "Course Details Error:",
            error
        );


        alert(
            "Unable to load course details."
        );
    }
}


//=====================================================
// FIND COURSE
//=====================================================

async function findCourse(
    key
) {

    try {

        //=================================================
        // DIRECT ID
        //=================================================

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


    const courses =
        await getData(
            "courses"
        );


    if (!Array.isArray(courses)) {

        return null;
    }


    const normalized =
        String(key)
            .trim()
            .toLowerCase();


    return courses.find(
        item => {

            const possibleValues = [

                item.id,

                item.key,

                item.courseKey,

                item.title

            ];


            return possibleValues.some(
                value =>
                    value !== undefined &&
                    value !== null &&
                    String(value)
                        .trim()
                        .toLowerCase() ===
                    normalized
            );
        }
    ) || null;
}


//=====================================================
// NORMALIZE MODULES
//=====================================================

function getModules() {

    if (
        Array.isArray(course.modules) &&
        course.modules.length > 0
    ) {

        return course.modules.map(
            module => {

                if (
                    typeof module === "string"
                ) {

                    return module;
                }


                return (
                    module.title ||
                    module.name ||
                    module.module ||
                    "Course Module"
                );
            }
        );
    }


    if (
        Array.isArray(course.syllabus)
    ) {

        return course.syllabus.map(
            item => {

                if (
                    typeof item === "string"
                ) {

                    return item;
                }


                return (
                    item.title ||
                    item.name ||
                    "Course Module"
                );
            }
        );
    }


    return [];
}


//=====================================================
// SKILLS
//=====================================================

function getSkills() {

    if (
        Array.isArray(course.skills)
    ) {

        return course.skills;
    }


    return [];
}


//=====================================================
// OUTCOMES
//=====================================================

function getOutcomes() {

    if (
        Array.isArray(course.outcomes)
    ) {

        return course.outcomes;
    }


    return [];
}


//=====================================================
// PREREQUISITES
//=====================================================

function getPrerequisites() {

    if (
        Array.isArray(
            course.prerequisites
        )
    ) {

        return course.prerequisites;
    }


    return [];
}


//=====================================================
// RENDER COURSE
//=====================================================

function renderCourse() {

    //=================================================
    // BASIC DETAILS
    //=================================================

    setText(
        "title",
        course.title || ""
    );


    setText(
        "overview",
        course.overview ||
        course.description ||
        ""
    );


    setText(
        "courseDescription",
        course.description ||
        course.overview ||
        ""
    );


    setText(
        "duration",
        course.duration || ""
    );


    setText(
        "instructor",
        course.instructor || ""
    );


    setText(
        "level",
        course.level || ""
    );


    setText(
        "mode",
        course.mode || "Online"
    );


    setText(
        "instructorName",
        course.instructor || ""
    );


    setText(
        "instructorInfo",
        course.instructorInfo ||
        (
            course.instructor
                ? `${course.instructor} is the instructor for this course.`
                : ""
        )
    );


    //=================================================
    // IMAGE
    //=================================================

    const image =
        document.getElementById(
            "courseImage"
        );


    if (image) {

        image.src =
            course.image || "";


        image.alt =
            course.title ||
            "Course Image";
    }


    document.title =
        `${course.title || "Course"} | CourseMS`;


    //=================================================
    // MODULES
    //=================================================

    const modules =
        getModules();


    const modulesContainer =
        document.getElementById(
            "modules"
        );


    if (modulesContainer) {

        if (
            modules.length === 0
        ) {

            modulesContainer.innerHTML = `

                <div class="module-card">

                    <h3>
                        Course Modules
                    </h3>

                    <p>
                        Module information will be available soon.
                    </p>

                </div>
            `;

        }

        else {

            modulesContainer.innerHTML =
                modules
                    .map(
                        (module, index) => `

                            <div class="module-card">

                                <h3>
                                    Module ${index + 1}
                                </h3>

                                <p>
                                    ${escapeHTML(module)}
                                </p>

                            </div>
                        `
                    )
                    .join("");
        }
    }


    //=================================================
    // SKILLS
    //=================================================

    renderListCards(
        "skills",
        getSkills(),
        "Develop practical knowledge in"
    );


    //=================================================
    // OUTCOMES
    //=================================================

    renderListCards(
        "outcomes",
        getOutcomes(),
        "Learning outcome"
    );


    //=================================================
    // PREREQUISITES
    //=================================================

    renderListCards(
        "prerequisites",
        getPrerequisites(),
        "Recommended before starting the course"
    );
}


//=====================================================
// RENDER LIST CARDS
//=====================================================

function renderListCards(
    elementId,
    items,
    description
) {

    const container =
        document.getElementById(
            elementId
        );


    if (!container) {

        return;
    }


    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        container.innerHTML = `

            <div class="skill-card">

                <p>
                    Information will be available soon.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        items
            .map(
                item => {

                    const text =
                        typeof item === "string"
                            ? item
                            : (
                                item.title ||
                                item.name ||
                                String(item)
                            );


                    return `

                        <div class="skill-card">

                            <h3>
                                ${escapeHTML(text)}
                            </h3>

                            <p>
                                ${escapeHTML(description)}
                                ${escapeHTML(text)}.
                            </p>

                        </div>
                    `;
                }
            )
            .join("");
}


//=====================================================
// CHECK ENROLLMENT
//=====================================================

async function checkEnrollment() {

    if (
        !student ||
        !course
    ) {

        return;
    }


    const enrollments =
        await queryData(
            "enrollments",
            {
                studentEmail:
                    student.email
            }
        );


    const alreadyEnrolled =
        Array.isArray(enrollments) &&
        enrollments.some(
            enrollment =>
                sameCourse(
                    enrollment
                )
        );


    const enrollBtn =
        document.querySelector(
            ".enroll-btn"
        );


    if (
        alreadyEnrolled &&
        enrollBtn
    ) {

        enrollBtn.textContent =
            "Already Enrolled";


        enrollBtn.disabled =
            true;
    }
}


//=====================================================
// SAME COURSE CHECK
//=====================================================

function sameCourse(
    enrollment
) {

    const courseId =
        getCourseId();


    return Boolean(

        (
            enrollment.courseId !== undefined &&
            String(enrollment.courseId) ===
            String(courseId)
        )

        ||

        (
            enrollment.courseKey &&
            String(enrollment.courseKey) ===
            String(courseKey)
        )

        ||

        (
            enrollment.title &&
            enrollment.title ===
            course.title
        )

        ||

        (
            enrollment.course &&
            enrollment.course ===
            course.title
        )
    );
}


//=====================================================
// ENROLL COURSE
//=====================================================

async function enrollCourse() {

    try {

        if (
            !student ||
            !course
        ) {

            return;
        }


        //=================================================
        // CHECK DUPLICATE
        //=================================================

        const enrollments =
            await queryData(
                "enrollments",
                {
                    studentEmail:
                        student.email
                }
            );


        const alreadyEnrolled =
            Array.isArray(enrollments) &&
            enrollments.some(
                enrollment =>
                    sameCourse(
                        enrollment
                    )
            );


        if (alreadyEnrolled) {

            alert(
                "You have already enrolled in this course."
            );


            await checkEnrollment();

            return;
        }


        //=================================================
        // SAVE SELECTED COURSE
        //=================================================

        await patchData(
            "appState",
            "current",
            {
                selectedCourseKey:
                    courseKey
            }
        );


        //=================================================
        // CREATE ENROLLMENT
        //=================================================

        const enrollmentRecord = {

            studentId:
                student.id,

            student:
                student.studentName ||
                student.name ||
                student.email,

            studentName:
                student.studentName ||
                student.name ||
                "",

            studentEmail:
                student.email,

            courseId:
                getCourseId(),

            courseKey:
                course.courseKey ||
                course.key ||
                courseKey,

            title:
                course.title,

            course:
                course.title,

            enrollDate:
                new Date()
                    .toLocaleDateString(),

            status:
                "Pending",

            completed:
                false
        };


        await saveData(
            "enrollments",
            enrollmentRecord
        );


        window.location.href =
            "/enrollment-success";

    }

    catch (error) {

        console.error(
            "Enrollment Error:",
            error
        );


        alert(
            "Unable to enroll in this course."
        );
    }
}


//=====================================================
// COURSE ID
//=====================================================

function getCourseId() {

    return (
        course.id ||
        course.courseKey ||
        course.key ||
        courseKey
    );
}


//=====================================================
// BUTTON INITIALIZATION
//=====================================================

function initializeButtons() {

    const enrollBtn =
        document.querySelector(
            ".enroll-btn"
        );


    /*
     * CourseDetails.jsx already calls
     * window.enrollCourse().
     *
     * Therefore we do NOT add another click
     * handler here. That prevents duplicate
     * enrollment requests.
     */


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


//=====================================================
// REACT-SAFE INITIALIZATION
//=====================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCourseDetails,
        {
            once: true
        }
    );

}

else {

    initializeCourseDetails();
}


//=====================================================
// GLOBAL FUNCTIONS
//=====================================================

window.enrollCourse =
    enrollCourse;

window.logout =
    logout;