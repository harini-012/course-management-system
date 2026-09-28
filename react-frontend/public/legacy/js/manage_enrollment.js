//=====================================================
// MANAGE ENROLLMENTS
// MOCK API + REACT VERSION
//=====================================================

import {
    getData,
    getById,
    patchData,
    getSession,
    clearSessions
} from "./api.js";


let enrollments = [];
let currentAdmin = null;


//=====================================================
// INITIALIZE
//=====================================================

async function initializeManageEnrollment() {

    try {

        const validAdmin =
            await verifyAdmin();


        if (!validAdmin) {
            return;
        }


        await loadEnrollments();

        renderEnrollments();

        initializeSearch();

        initializeFilter();

        initializeLogoutButton();

    }

    catch (error) {

        console.error(
            "Manage Enrollment Error:",
            error
        );


        alert(
            "Unable to load enrollments."
        );
    }
}


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
            "Admin Verification Error:",
            error
        );


        window.location.replace(
            "/login"
        );

        return false;
    }
}


//=====================================================
// LOAD ENROLLMENTS
//=====================================================

async function loadEnrollments() {

    const data =
        await getData(
            "enrollments"
        );


    enrollments =
        Array.isArray(data)
            ? data
            : [];
}


//=====================================================
// RENDER ENROLLMENTS
//=====================================================

function renderEnrollments(
    data = enrollments
) {

    const table =
        document.getElementById(
            "enrollmentTable"
        );


    const container =
        document.getElementById(
            "enrollmentContainer"
        );


    const target =
        table || container;


    if (!target) {

        console.warn(
            "Enrollment container not found."
        );

        return;
    }


    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        target.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:30px;
                        color:gray;
                    "
                >
                    No enrollments found.
                </td>

            </tr>
        `;

        updateStatistics();

        return;
    }


    target.innerHTML =
        data
            .map(
                enrollment => {

                    const studentName =
                        enrollment.studentName ||
                        enrollment.student ||
                        enrollment.studentEmail ||
                        "Student";


                    const courseName =
                        enrollment.title ||
                        enrollment.course ||
                        enrollment.courseTitle ||
                        "Course";


                    const status =
                        enrollment.status ||
                        "Pending";


                    const enrollmentDate =
                        enrollment.enrollDate ||
                        enrollment.enrollmentDate ||
                        "-";


                    const id =
                        escapeAttribute(
                            enrollment.id
                        );


                    return `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    studentName
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    enrollment.studentEmail ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    courseName
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    enrollmentDate
                                )}
                            </td>

                            <td>

                                <span
                                    class="status ${getStatusClass(
                                        status
                                    )}"
                                >
                                    ${escapeHTML(
                                        status
                                    )}
                                </span>

                            </td>

                            <td>

                                ${
                                    String(status)
                                        .toLowerCase() ===
                                    "pending"
                                        ? `

                                            <button
                                                class="approve-btn"
                                                onclick="approveEnrollment('${id}')"
                                            >
                                                Approve
                                            </button>

                                            <button
                                                class="reject-btn"
                                                onclick="rejectEnrollment('${id}')"
                                            >
                                                Reject
                                            </button>
                                        `
                                        : `
                                            <button
                                                class="action-btn"
                                                onclick="resetEnrollment('${id}')"
                                            >
                                                Set Pending
                                            </button>
                                        `
                                }

                            </td>

                        </tr>
                    `;
                }
            )
            .join("");


    updateStatistics();
}


//=====================================================
// STATUS CLASS
//=====================================================

function getStatusClass(
    status
) {

    const value =
        String(status || "")
            .toLowerCase();


    if (value === "approved") {
        return "approved";
    }


    if (value === "rejected") {
        return "rejected";
    }


    if (value === "completed") {
        return "completed";
    }


    return "pending";
}


//=====================================================
// APPROVE ENROLLMENT
//=====================================================

async function approveEnrollment(
    enrollmentId
) {

    const enrollment =
        findEnrollment(
            enrollmentId
        );


    if (!enrollment) {

        alert(
            "Enrollment not found."
        );

        return;
    }


    if (
        !confirm(
            "Approve this enrollment?"
        )
    ) {
        return;
    }


    try {

        const updated =
            await patchData(
                "enrollments",
                enrollment.id,
                {
                    status:
                        "Approved",

                    approved:
                        true,

                    approvedDate:
                        new Date()
                            .toLocaleDateString(),

                    approvedBy:
                        currentAdmin
                            ?.adminName ||
                        currentAdmin
                            ?.name ||
                        currentAdmin
                            ?.email ||
                        "Administrator"
                }
            );


        replaceEnrollment(
            updated
        );


        renderCurrentFilter();


        alert(
            "Enrollment Approved Successfully."
        );

    }

    catch (error) {

        console.error(
            "Approve Enrollment Error:",
            error
        );


        alert(
            "Unable to approve enrollment."
        );
    }
}


//=====================================================
// REJECT ENROLLMENT
//=====================================================

async function rejectEnrollment(
    enrollmentId
) {

    const enrollment =
        findEnrollment(
            enrollmentId
        );


    if (!enrollment) {

        alert(
            "Enrollment not found."
        );

        return;
    }


    if (
        !confirm(
            "Reject this enrollment?"
        )
    ) {
        return;
    }


    try {

        const updated =
            await patchData(
                "enrollments",
                enrollment.id,
                {
                    status:
                        "Rejected",

                    approved:
                        false,

                    rejectedDate:
                        new Date()
                            .toLocaleDateString(),

                    rejectedBy:
                        currentAdmin
                            ?.adminName ||
                        currentAdmin
                            ?.name ||
                        currentAdmin
                            ?.email ||
                        "Administrator"
                }
            );


        replaceEnrollment(
            updated
        );


        renderCurrentFilter();


        alert(
            "Enrollment Rejected."
        );

    }

    catch (error) {

        console.error(
            "Reject Enrollment Error:",
            error
        );


        alert(
            "Unable to reject enrollment."
        );
    }
}


//=====================================================
// RESET TO PENDING
//=====================================================

async function resetEnrollment(
    enrollmentId
) {

    const enrollment =
        findEnrollment(
            enrollmentId
        );


    if (!enrollment) {

        alert(
            "Enrollment not found."
        );

        return;
    }


    if (
        String(
            enrollment.status || ""
        ).toLowerCase() ===
        "completed"
    ) {

        alert(
            "Completed enrollment cannot be changed to Pending."
        );

        return;
    }


    try {

        const updated =
            await patchData(
                "enrollments",
                enrollment.id,
                {
                    status:
                        "Pending",

                    approved:
                        false
                }
            );


        replaceEnrollment(
            updated
        );


        renderCurrentFilter();

    }

    catch (error) {

        console.error(
            "Reset Enrollment Error:",
            error
        );


        alert(
            "Unable to update enrollment."
        );
    }
}


//=====================================================
// FIND ENROLLMENT
//=====================================================

function findEnrollment(
    enrollmentId
) {

    return enrollments.find(
        enrollment =>
            String(
                enrollment.id
            ) ===
            String(
                enrollmentId
            )
    ) || null;
}


//=====================================================
// REPLACE LOCAL COPY
//=====================================================

function replaceEnrollment(
    updated
) {

    if (!updated) {
        return;
    }


    enrollments =
        enrollments.map(
            enrollment =>
                String(
                    enrollment.id
                ) ===
                String(
                    updated.id
                )
                    ? updated
                    : enrollment
        );
}


//=====================================================
// SEARCH
//=====================================================

function initializeSearch() {

    const search =
        document.getElementById(
            "searchEnrollment"
        )
        ||
        document.getElementById(
            "searchInput"
        );


    if (
        !search ||
        search.dataset.initialized ===
            "true"
    ) {
        return;
    }


    search.dataset.initialized =
        "true";


    search.addEventListener(
        "input",
        renderCurrentFilter
    );
}


//=====================================================
// FILTER
//=====================================================

function initializeFilter() {

    const filter =
        document.getElementById(
            "statusFilter"
        );


    if (
        !filter ||
        filter.dataset.initialized ===
            "true"
    ) {
        return;
    }


    filter.dataset.initialized =
        "true";


    filter.addEventListener(
        "change",
        renderCurrentFilter
    );
}


//=====================================================
// APPLY SEARCH + FILTER
//=====================================================

function renderCurrentFilter() {

    const search =
        document.getElementById(
            "searchEnrollment"
        )
        ||
        document.getElementById(
            "searchInput"
        );


    const filter =
        document.getElementById(
            "statusFilter"
        );


    const keyword =
        String(
            search?.value || ""
        )
            .trim()
            .toLowerCase();


    const status =
        String(
            filter?.value || ""
        )
            .trim()
            .toLowerCase();


    const filtered =
        enrollments.filter(
            enrollment => {

                const searchable =
                    [
                        enrollment.student,
                        enrollment.studentName,
                        enrollment.studentEmail,
                        enrollment.title,
                        enrollment.course,
                        enrollment.courseTitle
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                const matchesSearch =
                    keyword === "" ||
                    searchable.includes(
                        keyword
                    );


                const currentStatus =
                    String(
                        enrollment.status ||
                        "Pending"
                    )
                        .toLowerCase();


                const matchesStatus =
                    status === "" ||
                    status === "all" ||
                    currentStatus ===
                        status;


                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );


    renderEnrollments(
        filtered
    );
}


//=====================================================
// STATISTICS
//=====================================================

function updateStatistics() {

    const pending =
        enrollments.filter(
            item =>
                String(
                    item.status ||
                    "Pending"
                )
                    .toLowerCase() ===
                "pending"
        ).length;


    const approved =
        enrollments.filter(
            item =>
                String(
                    item.status || ""
                )
                    .toLowerCase() ===
                "approved"
        ).length;


    const rejected =
        enrollments.filter(
            item =>
                String(
                    item.status || ""
                )
                    .toLowerCase() ===
                "rejected"
        ).length;


    const completed =
        enrollments.filter(
            item =>
                item.completed === true
                ||
                String(
                    item.status || ""
                )
                    .toLowerCase() ===
                "completed"
        ).length;


    setText(
        "totalEnrollments",
        enrollments.length
    );


    setText(
        "pendingCount",
        pending
    );


    setText(
        "approvedCount",
        approved
    );


    setText(
        "rejectedCount",
        rejected
    );


    setText(
        "completedCount",
        completed
    );
}


//=====================================================
// BACK TO ADMIN DASHBOARD
//=====================================================

function backToDashboard() {

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
        initializeManageEnrollment,
        {
            once: true
        }
    );

}

else {

    initializeManageEnrollment();
}


//=====================================================
// GLOBAL FUNCTIONS
//=====================================================

window.approveEnrollment =
    approveEnrollment;

window.rejectEnrollment =
    rejectEnrollment;

window.resetEnrollment =
    resetEnrollment;

window.backToDashboard =
    backToDashboard;

window.logout =
    logout;