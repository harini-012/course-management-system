import {
    useNavigate
} from "react-router-dom";

import PageShell
    from "../components/PageShell";

import PageCss
    from "../components/PageCss";

import LegacyScript
    from "../components/LegacyScript";


export default function AdminDashboard() {

    const navigate =
        useNavigate();


    return (

        <>

            <PageCss
                href="/css/admin_dashboard.css"
            />


            <PageShell
                variant="adminnone"
            >

                <div className="container">

                    {/* ================= BANNER ================= */}

                    <div className="banner">

                        <div className="banner-text">

                            <h1>
                                Administrator Dashboard
                            </h1>


                            <p>
                                Manage courses, student enrollments,
                                reports and academic activities
                                through a centralized administration
                                panel.
                            </p>

                        </div>

                    </div>


                    {/* ================= STATISTICS ================= */}

                    <div className="stats">

                        <div className="card">

                            <h3>
                                Total Courses
                            </h3>

                            <div
                                className="number"
                                id="totalCourses"
                            >
                                0
                            </div>

                        </div>


                        <div className="card">

                            <h3>
                                Total Students
                            </h3>

                            <div
                                className="number"
                                id="totalStudents"
                            >
                                0
                            </div>

                        </div>


                        <div className="card">

                            <h3>
                                Total Enrollments
                            </h3>

                            <div
                                className="number"
                                id="totalEnrollments"
                            >
                                0
                            </div>

                        </div>


                        <div className="card">

                            <h3>
                                Course Completions
                            </h3>

                            <div
                                className="number"
                                id="courseCompletions"
                            >
                                0
                            </div>

                        </div>

                    </div>


                    {/* ================= MAIN ================= */}

                    <div className="main">

                        {/* ================= LEFT ================= */}

                        <div>

                            {/* ================= COURSE MANAGEMENT ================= */}

                            <div className="section">

                                <h2>
                                    Course Management
                                </h2>


                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "20px",
                                        flexWrap: "wrap",
                                        gap: "10px"
                                    }}
                                >

                                    <button
                                        type="button"
                                        className="action-btn"
                                        onClick={() =>
                                            navigate(
                                                "/add-course"
                                            )
                                        }
                                    >
                                        ➕ Add New Course
                                    </button>


                                    <button
                                        type="button"
                                        className="action-btn"
                                        onClick={() =>
                                            navigate(
                                                "/edit-course"
                                            )
                                        }
                                    >
                                        ✏️ Edit / Delete Courses
                                    </button>

                                </div>


                                <table>

                                    <thead>

                                        <tr>
                                            <th>Course Name</th>
                                            <th>Instructor</th>
                                            <th>Level</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>

                                    </thead>


                                    <tbody id="courseTable">
                                    </tbody>

                                </table>

                            </div>


                            {/* ================= ENROLLMENTS ================= */}

                            <div className="section">

                                <h2>
                                    Student Enrollments
                                </h2>


                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        marginBottom: "20px"
                                    }}
                                >

                                    <button
                                        type="button"
                                        className="action-btn"
                                        onClick={() =>
                                            navigate(
                                                "/manage-enrollment"
                                            )
                                        }
                                    >
                                        👨‍🎓 Manage Enrollments
                                    </button>

                                </div>


                                <table>

                                    <thead>

                                        <tr>
                                            <th>Student Name</th>
                                            <th>Course</th>
                                            <th>Status</th>
                                        </tr>

                                    </thead>


                                    <tbody id="enrollmentTable">
                                    </tbody>

                                </table>

                            </div>


                            {/* ================= REPORTS ================= */}

                            <div className="section">

                                <h2>
                                    Reports Overview
                                </h2>


                                <table>

                                    <thead>

                                        <tr>
                                            <th>Report</th>
                                            <th>Status</th>
                                        </tr>

                                    </thead>


                                    <tbody>

                                        <tr>
                                            <td>
                                                Student Performance
                                            </td>

                                            <td>
                                                Available
                                            </td>
                                        </tr>


                                        <tr>
                                            <td>
                                                Course Completion
                                            </td>

                                            <td>
                                                Available
                                            </td>
                                        </tr>


                                        <tr>
                                            <td>
                                                Enrollment Summary
                                            </td>

                                            <td>
                                                Available
                                            </td>
                                        </tr>


                                        <tr>
                                            <td>
                                                Attendance Report
                                            </td>

                                            <td>
                                                Available
                                            </td>
                                        </tr>

                                    </tbody>

                                </table>

                            </div>


                            {/* ================= NOTIFICATIONS ================= */}

                            <div className="section">

                                <h2>
                                    System Notifications
                                </h2>


                                <div id="notificationContainer">

                                    <p
                                        style={{
                                            textAlign: "center",
                                            color: "gray",
                                            padding: "30px",
                                            lineHeight: "28px"
                                        }}
                                    >
                                        No new notifications available.
                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* ================= RIGHT ================= */}

                        <div>

                            <div className="section">

                                <h2>
                                    Admin Tools
                                </h2>


                                <div className="feature-card">

                                    <button
                                        type="button"
                                        className="action-btn"
                                        onClick={() =>
                                            navigate(
                                                "/add-course"
                                            )
                                        }
                                    >
                                        ➕ Add Course
                                    </button>

                                </div>


                                <div className="feature-card">

                                    <button
                                        type="button"
                                        className="action-btn"
                                        onClick={() =>
                                            navigate(
                                                "/edit-course"
                                            )
                                        }
                                    >
                                        ✏️ Edit / Delete Courses
                                    </button>

                                </div>


                                <div className="feature-card">

                                    <button
                                        type="button"
                                        className="action-btn"
                                        onClick={() =>
                                            navigate(
                                                "/manage-enrollment"
                                            )
                                        }
                                    >
                                        👨‍🎓 Manage Enrollments
                                    </button>

                                </div>

                            </div>


                            {/* ================= OVERVIEW ================= */}

                            <div className="section">

                                <h2>
                                    Dashboard Overview
                                </h2>


                                <img
                                    src="https://picsum.photos/450/230"
                                    alt="Dashboard Overview"
                                    style={{
                                        width: "100%",
                                        borderRadius: "12px"
                                    }}
                                />


                                <p
                                    style={{
                                        textAlign: "center",
                                        marginTop: "18px",
                                        color: "gray",
                                        lineHeight: "28px"
                                    }}
                                >
                                    Analytics, charts, course statistics,
                                    enrollment trends and overall system
                                    insights will be displayed here.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </PageShell>


            <LegacyScript
                src="/legacy/js/admin_dashboard.js"
            />

        </>
    );
}