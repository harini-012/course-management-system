//=====================================================
// EDIT COURSE
// MOCK API + REACT VERSION
//=====================================================

import {
    getData,
    getById,
    patchData,
    getSession,
    clearSessions
} from "./api.js";


let currentAdmin = null;

let currentCourse = null;

let currentCourseId = null;


//=====================================================
// INITIALIZE
//=====================================================

async function initializeEditCourse() {

    try {

        const validAdmin =
            await verifyAdmin();


        if (!validAdmin) {
            return;
        }


        //=================================================
        // GET EDIT COURSE ID
        //=================================================

        const appState =
            await getById(
                "appState",
                "current"
            );


        currentCourseId =
            appState
                ? appState.editCourseId
                : null;


        if (!currentCourseId) {

            alert(
                "No course selected for editing."
            );


            window.location.replace(
                "/admin-dashboard"
            );

            return;
        }


        //=================================================
        // GET COURSE
        //=================================================

        currentCourse =
            await findCourse(
                currentCourseId
            );


        if (!currentCourse) {

            alert(
                "Course not found."
            );


            window.location.replace(
                "/admin-dashboard"
            );

            return;
        }


        currentCourseId =
            currentCourse.id;


        //=================================================
        // POPULATE FORM
        //=================================================

        populateCourseForm();


        //=================================================
        // SUBMIT
        //=================================================

        const form =
            document.getElementById(
                "editCourseForm"
            )
            ||
            document.getElementById(
                "courseForm"
            );


        if (!form) {

            console.error(
                "Edit Course Form Not Found."
            );

            return;
        }


        if (
            form.dataset.initialized !==
            "true"
        ) {

            form.dataset.initialized =
                "true";


            form.addEventListener(
                "submit",
                updateCourse
            );
        }


        initializeLogoutButton();

    }

    catch (error) {

        console.error(
            "Edit Course Initialization Error:",
            error
        );


        alert(
            "Unable to load course."
        );
    }
}


//=====================================================
// VERIFY ADMIN
//=====================================================

async function verifyAdmin() {

    const session =
        await getSession();


    if (
        !session ||
        session.role !== "admin"
    ) {

        window.location.replace(
            "/login"
        );

        return false;
    }


    currentAdmin =
        await getById(
            "admins",
            session.userId
        );


    if (
        !currentAdmin ||
        currentAdmin.active === false
    ) {

        await clearSessions();


        window.location.replace(
            "/login"
        );

        return false;
    }


    return true;
}


//=====================================================
// FIND COURSE
//=====================================================

async function findCourse(
    id
) {

    try {

        const direct =
            await getById(
                "courses",
                id
            );


        if (direct) {

            return direct;
        }

    }

    catch (error) {

        // Continue with fallback.
    }


    const courses =
        await getData(
            "courses"
        );


    if (
        !Array.isArray(courses)
    ) {

        return null;
    }


    const normalized =
        String(id)
            .toLowerCase();


    return courses.find(
        course =>

            String(
                course.id || ""
            ).toLowerCase() ===
            normalized

            ||

            String(
                course.key || ""
            ).toLowerCase() ===
            normalized

            ||

            String(
                course.courseKey || ""
            ).toLowerCase() ===
            normalized

    ) || null;
}


//=====================================================
// POPULATE FORM
//=====================================================

function populateCourseForm() {

    setValue(
        currentCourse.title || "",
        "courseTitle",
        "title"
    );


    setValue(
        currentCourse.instructor || "",
        "courseInstructor",
        "instructor"
    );


    setValue(
        currentCourse.duration || "",
        "courseDuration",
        "duration"
    );


    setValue(
        currentCourse.level || "",
        "courseLevel",
        "level"
    );


    setValue(
        currentCourse.mode || "Online",
        "courseMode",
        "mode"
    );


    setValue(
        currentCourse.status || "Active",
        "courseStatus",
        "status"
    );


    setValue(
        currentCourse.image || "",
        "courseImage",
        "image"
    );


    setValue(
        currentCourse.overview || "",
        "courseOverview",
        "overview"
    );


    setValue(
        currentCourse.description || "",
        "courseDescription",
        "description"
    );


    setValue(
        currentCourse.instructorInfo ||
        "",
        "instructorInfo"
    );


    setValue(
        arrayToText(
            currentCourse.modules
        ),
        "courseModules",
        "modules"
    );


    setValue(
        arrayToText(
            currentCourse.syllabus
        ),
        "courseSyllabus",
        "syllabus"
    );


    setValue(
        arrayToText(
            currentCourse.skills
        ),
        "courseSkills",
        "skills"
    );


    setValue(
        arrayToText(
            currentCourse.outcomes
        ),
        "courseOutcomes",
        "outcomes"
    );


    setValue(
        arrayToText(
            currentCourse.prerequisites
        ),
        "coursePrerequisites",
        "prerequisites"
    );


    setValue(
        videosToText(
            currentCourse.videos
        ),
        "courseVideos",
        "videos"
    );


    setValue(
        materialsToText(
            currentCourse.materials
        ),
        "courseMaterials",
        "materials"
    );
}


//=====================================================
// UPDATE COURSE
//=====================================================

async function updateCourse(
    event
) {

    event.preventDefault();


    try {

        if (
            !currentCourse ||
            currentCourseId === null ||
            currentCourseId === undefined
        ) {

            alert(
                "Course not found."
            );

            return;
        }


        const title =
            getValue(
                "courseTitle",
                "title"
            );


        const instructor =
            getValue(
                "courseInstructor",
                "instructor"
            );


        const duration =
            getValue(
                "courseDuration",
                "duration"
            );


        const level =
            getValue(
                "courseLevel",
                "level"
            );


        if (!title) {

            alert(
                "Please enter Course Title."
            );

            return;
        }


        if (!instructor) {

            alert(
                "Please enter Instructor Name."
            );

            return;
        }


        if (!duration) {

            alert(
                "Please enter Course Duration."
            );

            return;
        }


        if (!level) {

            alert(
                "Please select Course Level."
            );

            return;
        }


        //=================================================
        // KEEP STABLE KEY
        //=================================================

        const stableKey =
            currentCourse.courseKey ||
            currentCourse.key ||
            currentCourse.id;


        const updatedData = {

            title:
                title,

            instructor:
                instructor,

            duration:
                duration,

            level:
                level,

            mode:
                getValue(
                    "courseMode",
                    "mode"
                ) || "Online",

            status:
                getValue(
                    "courseStatus",
                    "status"
                ) || "Active",

            image:
                getValue(
                    "courseImage",
                    "image"
                ),

            overview:
                getValue(
                    "courseOverview",
                    "overview"
                ),

            description:
                getValue(
                    "courseDescription",
                    "description"
                ),

            instructorInfo:
                getValue(
                    "instructorInfo"
                ),

            modules:
                readList(
                    "courseModules",
                    "modules"
                ),

            syllabus:
                readList(
                    "courseSyllabus",
                    "syllabus"
                ),

            skills:
                readList(
                    "courseSkills",
                    "skills"
                ),

            outcomes:
                readList(
                    "courseOutcomes",
                    "outcomes"
                ),

            prerequisites:
                readList(
                    "coursePrerequisites",
                    "prerequisites"
                ),

            videos:
                readVideos(),

            materials:
                readMaterials(),

            key:
                stableKey,

            courseKey:
                stableKey,

            updatedBy:
                currentAdmin
                    ?.email ||
                "",

            updatedAt:
                new Date()
                    .toISOString()
        };


        currentCourse =
            await patchData(
                "courses",
                currentCourseId,
                updatedData
            );


        //=================================================
        // CLEAR EDIT STATE
        //=================================================

        try {

            await patchData(
                "appState",
                "current",
                {
                    editCourseId:
                        null
                }
            );

        }

        catch (error) {

            console.error(
                "Unable to clear edit state:",
                error
            );
        }


        alert(
            "Course Updated Successfully!"
        );


        window.location.replace(
            "/admin-dashboard"
        );

    }

    catch (error) {

        console.error(
            "Update Course Error:",
            error
        );


        alert(
            "Unable to update course."
        );
    }
}


//=====================================================
// LIST TO TEXT
//=====================================================

function arrayToText(
    data
) {

    if (
        !Array.isArray(data)
    ) {
        return "";
    }


    return data
        .map(
            item => {

                if (
                    typeof item ===
                    "string"
                ) {

                    return item;
                }


                return (
                    item.title ||
                    item.name ||
                    item.module ||
                    ""
                );
            }
        )
        .filter(Boolean)
        .join("\n");
}


//=====================================================
// VIDEOS TO TEXT
//=====================================================

function videosToText(
    data
) {

    if (
        !Array.isArray(data)
    ) {
        return "";
    }


    return data
        .map(
            video => {

                if (
                    typeof video ===
                    "string"
                ) {

                    return video;
                }


                const title =
                    video.title ||
                    video.name ||
                    "";


                const url =
                    video.url ||
                    video.videoUrl ||
                    video.src ||
                    video.link ||
                    "";


                if (
                    title &&
                    url
                ) {

                    return `${title}|${url}`;
                }


                return url || title;
            }
        )
        .filter(Boolean)
        .join("\n");
}


//=====================================================
// MATERIALS TO TEXT
//=====================================================

function materialsToText(
    data
) {

    if (
        !Array.isArray(data)
    ) {
        return "";
    }


    return data
        .map(
            material => {

                if (
                    typeof material ===
                    "string"
                ) {

                    return material;
                }


                const title =
                    material.title ||
                    material.name ||
                    "";


                const url =
                    material.url ||
                    material.link ||
                    material.src ||
                    "";


                if (
                    title &&
                    url
                ) {

                    return `${title}|${url}`;
                }


                return url || title;
            }
        )
        .filter(Boolean)
        .join("\n");
}


//=====================================================
// READ LIST
//=====================================================

function readList(
    ...ids
) {

    const value =
        getValue(
            ...ids
        );


    if (!value) {
        return [];
    }


    return value
        .split(
            /\n|,/
        )
        .map(
            item =>
                item.trim()
        )
        .filter(Boolean);
}


//=====================================================
// READ VIDEOS
//=====================================================

function readVideos() {

    const value =
        getValue(
            "courseVideos",
            "videos"
        );


    if (!value) {
        return [];
    }


    return value
        .split("\n")
        .map(
            line =>
                line.trim()
        )
        .filter(Boolean)
        .map(
            (line, index) => {

                const separator =
                    line.indexOf("|");


                if (
                    separator === -1
                ) {

                    return {

                        id:
                            `video-${index + 1}`,

                        title:
                            `Lesson ${index + 1}`,

                        url:
                            line
                    };
                }


                return {

                    id:
                        `video-${index + 1}`,

                    title:
                        line
                            .slice(
                                0,
                                separator
                            )
                            .trim()
                        ||
                        `Lesson ${index + 1}`,

                    url:
                        line
                            .slice(
                                separator + 1
                            )
                            .trim()
                };
            }
        );
}


//=====================================================
// READ MATERIALS
//=====================================================

function readMaterials() {

    const value =
        getValue(
            "courseMaterials",
            "materials"
        );


    if (!value) {
        return [];
    }


    return value
        .split("\n")
        .map(
            line =>
                line.trim()
        )
        .filter(Boolean)
        .map(
            (line, index) => {

                const separator =
                    line.indexOf("|");


                if (
                    separator === -1
                ) {

                    return {

                        title:
                            `Material ${index + 1}`,

                        url:
                            line
                    };
                }


                return {

                    title:
                        line
                            .slice(
                                0,
                                separator
                            )
                            .trim()
                        ||
                        `Material ${index + 1}`,

                    url:
                        line
                            .slice(
                                separator + 1
                            )
                            .trim()
                };
            }
        );
}


//=====================================================
// GET VALUE
//=====================================================

function getValue(
    ...ids
) {

    for (
        const id of ids
    ) {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            return String(
                element.value || ""
            ).trim();
        }
    }


    return "";
}


//=====================================================
// SET VALUE
//=====================================================

function setValue(
    value,
    ...ids
) {

    for (
        const id of ids
    ) {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            element.value =
                value ?? "";

            return;
        }
    }
}


//=====================================================
// CANCEL EDIT
//=====================================================

async function cancelEdit() {

    try {

        await patchData(
            "appState",
            "current",
            {
                editCourseId:
                    null
            }
        );

    }

    catch (error) {

        console.error(
            "Unable to clear edit state:",
            error
        );
    }


    window.location.href =
        "/admin-dashboard";
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
// LOGOUT BUTTON
//=====================================================

function initializeLogoutButton() {

    const button =
        document.getElementById(
            "logoutBtn"
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
        logout
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
        initializeEditCourse,
        {
            once: true
        }
    );

}

else {

    initializeEditCourse();
}


//=====================================================
// GLOBAL FUNCTIONS
//=====================================================

window.updateCourse =
    updateCourse;

window.cancelEdit =
    cancelEdit;

window.logout =
    logout;