import {
    getData,
    getById,
    saveData,
    getSession,
    clearSessions
} from "./api.js";


let currentAdmin = null;


/* =====================================================
   INITIALIZE
===================================================== */

async function init() {

    try {

        const session = await getSession();

        if (
            !session ||
            session.role !== "admin"
        ) {
            window.location.replace("/login");
            return;
        }


        currentAdmin =
            await getById(
                "admins",
                session.userId
            );


        if (!currentAdmin) {
            await clearSessions();
            window.location.replace("/login");
            return;
        }


        const form =
            document.getElementById(
                "courseForm"
            );


        if (!form) {
            console.error("courseForm not found");
            return;
        }


        if (form.dataset.ready === "true") {
            return;
        }


        form.dataset.ready = "true";


        form.addEventListener(
            "submit",
            saveCourse
        );


        bindDynamicButtons();

    }

    catch (error) {

        console.error(
            "Add Course Init Error:",
            error
        );
    }
}


/* =====================================================
   BUTTONS
===================================================== */

function bindDynamicButtons() {

    bind(
        "addModuleBtn",
        () =>
            addTextField(
                "moduleContainer",
                "moduleInput",
                "Enter module"
            )
    );


    bind(
        "addSyllabusBtn",
        () =>
            addTextField(
                "syllabusContainer",
                "syllabusInput",
                "Enter syllabus topic"
            )
    );


    bind(
        "addSkillBtn",
        () =>
            addTextField(
                "skillContainer",
                "skillInput",
                "Enter skill"
            )
    );


    bind(
        "addOutcomeBtn",
        () =>
            addTextField(
                "outcomeContainer",
                "outcomeInput",
                "Enter learning outcome"
            )
    );


    bind(
        "addPrerequisiteBtn",
        () =>
            addTextField(
                "prerequisiteContainer",
                "prerequisiteInput",
                "Enter prerequisite"
            )
    );


    bind(
        "addVideoBtn",
        addVideoField
    );


    bind(
        "addMaterialBtn",
        addMaterialField
    );
}


function bind(id, handler) {

    const button =
        document.getElementById(id);

    if (!button) {
        console.warn(`${id} not found`);
        return;
    }

    if (button.dataset.bound === "true") {
        return;
    }

    button.dataset.bound = "true";

    button.addEventListener(
        "click",
        handler
    );
}


/* =====================================================
   SIMPLE DYNAMIC FIELD
===================================================== */

function addTextField(
    containerId,
    className,
    placeholder
) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) {
        return;
    }


    const row =
        document.createElement("div");

    row.className =
        "dynamic-row dynamic-added-row";


    row.innerHTML = `
        <input
            type="text"
            class="${className}"
            placeholder="${placeholder}"
        >

        <button
            type="button"
            class="remove-dynamic-btn"
            aria-label="Remove"
        >
            ×
        </button>
    `;


    row
        .querySelector(".remove-dynamic-btn")
        .addEventListener(
            "click",
            () => row.remove()
        );


    container.appendChild(row);


    row
        .querySelector("input")
        ?.focus();
}


/* =====================================================
   VIDEO FIELD
===================================================== */

function addVideoField() {

    const container =
        document.getElementById(
            "videoContainer"
        );

    if (!container) {
        return;
    }


    const row =
        document.createElement("div");

    row.className =
        "video-field-row";


    row.innerHTML = `
        <div class="input-box">

            <label>Lesson Name</label>

            <input
                type="text"
                class="videoTitleInput"
                placeholder="Lesson name"
            >

        </div>

        <div class="input-box">

            <label>Video URL</label>

            <input
                type="url"
                class="videoUrlInput"
                placeholder="https://www.youtube.com/watch?v=..."
            >

        </div>

        <button
            type="button"
            class="remove-dynamic-btn floating-remove"
        >
            ×
        </button>
    `;


    row
        .querySelector(".remove-dynamic-btn")
        .addEventListener(
            "click",
            () => row.remove()
        );


    container.appendChild(row);
}


/* =====================================================
   MATERIAL FIELD
===================================================== */

function addMaterialField() {

    const container =
        document.getElementById(
            "materialContainer"
        );

    if (!container) {
        return;
    }


    const row =
        document.createElement("div");

    row.className =
        "material-field-row";


    row.innerHTML = `
        <div class="input-box">

            <label>Material Name</label>

            <input
                type="text"
                class="materialTitleInput"
                placeholder="Material name"
            >

        </div>

        <div class="input-box">

            <label>Material URL</label>

            <input
                type="url"
                class="materialUrlInput"
                placeholder="https://..."
            >

        </div>

        <button
            type="button"
            class="remove-dynamic-btn floating-remove"
        >
            ×
        </button>
    `;


    row
        .querySelector(".remove-dynamic-btn")
        .addEventListener(
            "click",
            () => row.remove()
        );


    container.appendChild(row);
}


/* =====================================================
   SAVE COURSE
===================================================== */

async function saveCourse(event) {

    event.preventDefault();


    const button =
        document.getElementById(
            "saveCourseBtn"
        );


    try {

        if (button) {
            button.disabled = true;
            button.textContent =
                "Adding Course...";
        }


        const title =
            value("courseTitle");

        const instructor =
            value("instructor");

        const duration =
            value("duration");

        const level =
            value("level");


        if (
            !title ||
            !instructor ||
            !duration ||
            !level
        ) {

            alert(
                "Please complete all required course fields."
            );

            return;
        }


        let courseKey =
            value("courseKey");


        courseKey =
            slug(
                courseKey || title
            );


        const courses =
            await getData("courses");


        const duplicate =
            (courses || []).some(
                item =>
                    String(
                        item.courseKey ||
                        item.key ||
                        item.id ||
                        ""
                    ).toLowerCase() ===
                    courseKey.toLowerCase()
            );


        if (duplicate) {

            alert(
                "A course with this key already exists."
            );

            return;
        }


        const modules =
            collect(".moduleInput");

        const syllabus =
            collect(".syllabusInput");

        const skills =
            collect(".skillInput");

        const outcomes =
            collect(".outcomeInput");

        const prerequisites =
            collect(".prerequisiteInput");

        const videos =
            collectVideos();

        const materials =
            collectMaterials();


        const course = {

            id: courseKey,

            key: courseKey,

            courseKey,

            title,

            instructor,

            duration,

            level,

            mode:
                value("mode") ||
                "Online",

            status:
                value("status") ||
                "Active",

            image:
                value("courseImage"),

            overview:
                value("overview"),

            description:
                value("description"),

            instructorInfo:
                value("instructorInfo"),

            modules,

            syllabus,

            skills,

            outcomes,

            prerequisites,

            videos,

            materials,

            createdBy:
                currentAdmin?.email || "",

            createdAt:
                new Date().toISOString()
        };


        console.log(
            "COURSE BEING SAVED:",
            course
        );


        await saveData(
            "courses",
            course
        );


        alert(
            "Course Added Successfully!"
        );


        window.location.replace(
            "/admin-dashboard"
        );

    }

    catch (error) {

        console.error(
            "ADD COURSE ERROR:",
            error
        );


        alert(
            "Unable to add course. Check JSON Server and browser console."
        );

    }

    finally {

        if (button) {
            button.disabled = false;
            button.textContent =
                "Add Course";
        }
    }
}


/* =====================================================
   VIDEOS
===================================================== */

function collectVideos() {

    const rows =
        document.querySelectorAll(
            "#videoContainer .video-field-row"
        );


    return Array
        .from(rows)
        .map(
            (row, index) => {

                const title =
                    row
                        .querySelector(
                            ".videoTitleInput"
                        )
                        ?.value
                        .trim() || "";


                const url =
                    row
                        .querySelector(
                            ".videoUrlInput"
                        )
                        ?.value
                        .trim() || "";


                if (!url) {
                    return null;
                }


                return {
                    id:
                        `video-${index + 1}`,

                    title:
                        title ||
                        `Lesson ${index + 1}`,

                    url
                };
            }
        )
        .filter(Boolean);
}


/* =====================================================
   MATERIALS
===================================================== */

function collectMaterials() {

    const rows =
        document.querySelectorAll(
            "#materialContainer .material-field-row"
        );


    return Array
        .from(rows)
        .map(
            (row, index) => {

                const title =
                    row
                        .querySelector(
                            ".materialTitleInput"
                        )
                        ?.value
                        .trim() || "";


                const url =
                    row
                        .querySelector(
                            ".materialUrlInput"
                        )
                        ?.value
                        .trim() || "";


                if (!url) {
                    return null;
                }


                return {
                    id:
                        `material-${index + 1}`,

                    title:
                        title ||
                        `Material ${index + 1}`,

                    url
                };
            }
        )
        .filter(Boolean);
}


/* =====================================================
   HELPERS
===================================================== */

function collect(selector) {

    return Array
        .from(
            document.querySelectorAll(
                selector
            )
        )
        .map(
            element =>
                String(
                    element.value || ""
                ).trim()
        )
        .filter(Boolean);
}


function value(id) {

    return String(
        document
            .getElementById(id)
            ?.value || ""
    ).trim();
}


function slug(text) {

    return String(text || "")
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );
}


/* =====================================================
   INITIALIZE
===================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        init,
        { once: true }
    );

}
else {
    init();
}