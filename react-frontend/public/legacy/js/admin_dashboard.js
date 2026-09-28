//=====================================================
// ADMIN DASHBOARD
// MOCK API + REACT VERSION
//=====================================================

import {
    getData,
    getById,
    removeData,
    patchData,
    getSession,
    clearSessions
} from "./api.js";


//=====================================================
// DATA
//=====================================================

let courses = [];

let enrollments = [];

let students = [];

let currentAdmin = null;

let refreshTimer = null;


//=====================================================
// VERIFY ADMIN
//=====================================================

async function verifyAdmin() {

    try {

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

    catch (error) {

        console.error(
            "Admin Authentication Error:",
            error
        );


        window.location.replace(
            "/login"
        );


        return false;
    }
}


//=====================================================
// LOAD DASHBOARD DATA
//=====================================================

async function loadDashboardData() {

    try {

        const [
            courseData,
            enrollmentData,
            studentData
        ] =
            await Promise.all([

                getData(
                    "courses"
                ),

                getData(
                    "enrollments"
                ),

                getData(
                    "students"
                )

            ]);


        courses =
            Array.isArray(
                courseData
            )
                ? courseData
                : [];


        enrollments =
            Array.isArray(
                enrollmentData
            )
                ? enrollmentData
                : [];


        students =
            Array.isArray(
                studentData
            )
                ? studentData
                : [];

    }

    catch (error) {

        console.error(
            "Unable to load dashboard data:",
            error
        );


        courses = [];

        enrollments = [];

        students = [];
    }
}


//=====================================================
// STATISTICS
//=====================================================

function loadStatistics() {

    setText(
        "totalCourses",
        courses.length
    );


    setText(
        "totalStudents",
        students.length
    );


    setText(
        "totalEnrollments",
        enrollments.length
    );


    const completed =
        enrollments.filter(
            enrollment =>

                enrollment.completed === true

                ||

                String(
                    enrollment.status || ""
                ).toLowerCase() ===
                    "completed"

        ).length;


    setText(
        "courseCompletions",
        completed
    );
}


//=====================================================
// LOAD COURSES
//=====================================================

function loadCourses() {

    const table =
        document.getElementById(
            "courseTable"
        );


    if (!table) {

        return;
    }


    table.innerHTML =
        "";


    if (
        courses.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="
                        text-align:center;
                        color:gray;
                    "
                >

                    No courses found.

                </td>

            </tr>
        `;


        return;
    }


    courses.forEach(
        course => {

            table.innerHTML += `

                <tr>

                    <td>

                        ${escapeHTML(
                            course.title ||
                            "Course"
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            course.instructor ||
                            "-"
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            course.level ||
                            "-"
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            course.status ||
                            "Active"
                        )}

                    </td>


                    <td>

                        <button
                            class="action-btn"
                            onclick="editCourse('${escapeAttribute(
                                course.id
                            )}')"
                        >

                            Edit

                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteCourse('${escapeAttribute(
                                course.id
                            )}')"
                        >

                            Delete

                        </button>

                    </td>

                </tr>
            `;
        }
    );
}


//=====================================================
// DELETE COURSE
//=====================================================

async function deleteCourse(
    courseId
) {

    if (
        !confirm(
            "Delete this course?"
        )
    ) {

        return;
    }


    try {

        await removeData(
            "courses",
            courseId
        );


        courses =
            courses.filter(
                course =>
                    String(
                        course.id
                    ) !==
                    String(
                        courseId
                    )
            );


        loadCourses();

        loadStatistics();

        loadNotifications();

    }

    catch (error) {

        console.error(
            "Delete Course Error:",
            error
        );


        alert(
            "Unable to delete course."
        );
    }
}


//=====================================================
// EDIT COURSE
//=====================================================

async function editCourse(
    courseId
) {

    try {

        await patchData(
            "appState",
            "current",
            {
                editCourseId:
                    courseId
            }
        );


        window.location.href =
            "/edit-course";

    }

    catch (error) {

        console.error(
            "Edit Course Error:",
            error
        );


        alert(
            "Unable to open course editor."
        );
    }
}


//=====================================================
// LOAD ENROLLMENTS
//=====================================================

function loadEnrollments() {

    const table =
        document.getElementById(
            "enrollmentTable"
        );


    if (!table) {

        return;
    }


    table.innerHTML =
        "";


    if (
        enrollments.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    style="
                        text-align:center;
                        color:gray;
                    "
                >

                    No enrollments found.

                </td>

            </tr>
        `;


        return;
    }


    enrollments.forEach(
        enrollment => {

            const studentName =
                enrollment.student ||
                enrollment.studentName ||
                enrollment.studentEmail ||
                "Student";


            const courseName =
                enrollment.title ||
                enrollment.course ||
                enrollment.courseTitle ||
                "Course";


            let status =
                enrollment.status ||
                (
                    enrollment.completed
                        ? "Completed"
                        : "Enrolled"
                );


            table.innerHTML += `

                <tr>

                    <td>

                        ${escapeHTML(
                            studentName
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            courseName
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            status
                        )}

                    </td>

                </tr>
            `;
        }
    );
}


//=====================================================
// NOTIFICATIONS
//=====================================================

function loadNotifications() {

    const container =
        document.getElementById(
            "notificationContainer"
        );


    if (!container) {

        return;
    }


    const notifications =
        [];


    if (
        courses.length === 0
    ) {

        notifications.push(
            "No courses available."
        );
    }

    else {

        notifications.push(
            `${courses.length} courses are available.`
        );
    }


    if (
        students.length === 0
    ) {

        notifications.push(
            "No students registered yet."
        );
    }

    else {

        notifications.push(
            `${students.length} students registered.`
        );
    }


    if (
        enrollments.length === 0
    ) {

        notifications.push(
            "No students have enrolled yet."
        );
    }

    else {

        notifications.push(
            `${enrollments.length} student enrollments found.`
        );
    }


    container.innerHTML =
        notifications
            .map(
                note => `

                    <div
                        class="notification-item"
                    >

                        ${escapeHTML(
                            note
                        )}

                    </div>
                `
            )
            .join("");
}


//=====================================================
// SEARCH COURSE
//=====================================================

function searchCourse(
    keyword
) {

    const value =
        String(
            keyword || ""
        )
            .trim()
            .toLowerCase();


    if (value === "") {

        return courses;
    }


    return courses.filter(
        course =>

            String(
                course.title || ""
            )
                .toLowerCase()
                .includes(
                    value
                )
    );
}


//=====================================================
// DASHBOARD OVERVIEW
//=====================================================

function loadDashboardOverview() {

    const completedCourses =
        enrollments.filter(
            enrollment =>

                enrollment.completed === true

                ||

                String(
                    enrollment.status || ""
                ).toLowerCase() ===
                    "completed"

        ).length;


    console.log(
        "========== ADMIN DASHBOARD =========="
    );


    console.log(
        "Administrator:",
        currentAdmin?.email || "-"
    );


    console.log(
        "Total Courses:",
        courses.length
    );


    console.log(
        "Total Students:",
        students.length
    );


    console.log(
        "Total Enrollments:",
        enrollments.length
    );


    console.log(
        "Completed Courses:",
        completedCourses
    );
}


//=====================================================
// REFRESH DASHBOARD
//=====================================================

async function refreshDashboard() {

    try {

        const validAdmin =
            await verifyAdmin();


        if (!validAdmin) {

            return;
        }


        await loadDashboardData();


        loadStatistics();

        loadCourses();

        loadEnrollments();

        loadNotifications();

        loadDashboardOverview();

    }

    catch (error) {

        console.error(
            "Refresh Dashboard Error:",
            error
        );
    }
}


//=====================================================
// RESET DASHBOARD
//=====================================================

async function resetDashboard() {

    if (
        !confirm(
            "Reset dashboard data?"
        )
    ) {

        return;
    }


    try {

        const [
            currentCourses,
            currentEnrollments
        ] =
            await Promise.all([

                getData(
                    "courses"
                ),

                getData(
                    "enrollments"
                )

            ]);


        for (
            const course of
            currentCourses
        ) {

            if (
                course.id !== undefined &&
                course.id !== null
            ) {

                await removeData(
                    "courses",
                    course.id
                );
            }
        }


        for (
            const enrollment of
            currentEnrollments
        ) {

            if (
                enrollment.id !== undefined &&
                enrollment.id !== null
            ) {

                await removeData(
                    "enrollments",
                    enrollment.id
                );
            }
        }


        await refreshDashboard();

    }

    catch (error) {

        console.error(
            "Reset Dashboard Error:",
            error
        );


        alert(
            "Unable to reset dashboard data."
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
// LOGOUT BUTTON
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
// INITIALIZE DASHBOARD
//=====================================================

async function initializeDashboard() {

    initializeLogoutButton();


    const validAdmin =
        await verifyAdmin();


    if (!validAdmin) {

        return;
    }


    await refreshDashboard();


    //=================================================
    // AUTO REFRESH
    //=================================================

    if (!refreshTimer) {

        refreshTimer =
            setInterval(
                async () => {

                    /*
                     * Do not refresh this dashboard
                     * after React has navigated away.
                     */

                    if (
                        !document.getElementById(
                            "totalCourses"
                        ) &&
                        !document.getElementById(
                            "courseTable"
                        )
                    ) {

                        clearInterval(
                            refreshTimer
                        );


                        refreshTimer =
                            null;


                        return;
                    }


                    await refreshDashboard();

                },
                30000
            );
    }
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
        initializeDashboard,
        {
            once: true
        }
    );

}

else {

    initializeDashboard();
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
// GLOBAL FUNCTIONS
//=====================================================

window.editCourse =
    editCourse;

window.deleteCourse =
    deleteCourse;

window.searchCourse =
    searchCourse;

window.resetDashboard =
    resetDashboard;

window.refreshDashboard =
    refreshDashboard;

window.logout =
    logout;