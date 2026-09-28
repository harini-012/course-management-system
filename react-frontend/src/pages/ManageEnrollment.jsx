import {
    useNavigate
} from "react-router-dom";

import PageShell
    from "../components/PageShell";

import PageCss
    from "../components/PageCss";

import LegacyScript
    from "../components/LegacyScript";


export default function ManageEnrollment() {

    const navigate =
        useNavigate();


    return (

        <>

            <PageCss
                href="/css/manage_enrollment.css"
            />


            <PageShell
                variant="admin"
            >

                <div className="container">

                    {/* ================= BANNER ================= */}

                    <div className="banner">

                        <h1>
                            Manage Student Enrollments
                        </h1>


                        <p>
                            Review student enrollment requests,
                            approve or reject applications and
                            monitor enrollment status.
                        </p>

                    </div>


                    {/* ================= STATISTICS ================= */}

                    <div className="stats">

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
                                Pending
                            </h3>

                            <div
                                className="number"
                                id="pendingCount"
                            >
                                0
                            </div>

                        </div>


                        <div className="card">

                            <h3>
                                Approved
                            </h3>

                            <div
                                className="number"
                                id="approvedCount"
                            >
                                0
                            </div>

                        </div>


                        <div className="card">

                            <h3>
                                Rejected
                            </h3>

                            <div
                                className="number"
                                id="rejectedCount"
                            >
                                0
                            </div>

                        </div>


                        <div className="card">

                            <h3>
                                Completed
                            </h3>

                            <div
                                className="number"
                                id="completedCount"
                            >
                                0
                            </div>

                        </div>

                    </div>


                    {/* ================= SEARCH / FILTER ================= */}

                    <div className="search-box">

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "minmax(250px, 1fr) 220px",
                                gap: "15px"
                            }}
                        >

                            <input
                                type="text"
                                id="searchEnrollment"
                                placeholder="Search student, email or course..."
                            />


                            <select
                                id="statusFilter"
                                defaultValue="all"
                                style={{
                                    padding: "15px",
                                    border:
                                        "1px solid #CBD5E1",
                                    borderRadius: "10px",
                                    fontSize: "16px",
                                    outline: "none"
                                }}
                            >

                                <option value="all">
                                    All Status
                                </option>

                                <option value="pending">
                                    Pending
                                </option>

                                <option value="approved">
                                    Approved
                                </option>

                                <option value="rejected">
                                    Rejected
                                </option>

                                <option value="completed">
                                    Completed
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* ================= ENROLLMENT TABLE ================= */}

                    <div className="section">

                        <h2>
                            Enrollment Requests
                        </h2>


                        <div
                            style={{
                                width: "100%",
                                overflowX: "auto"
                            }}
                        >

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Course
                                        </th>

                                        <th>
                                            Enrollment Date
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody id="enrollmentTable">

                                    <tr>

                                        <td
                                            colSpan="6"
                                            style={{
                                                textAlign:
                                                    "center",
                                                padding:
                                                    "30px",
                                                color:
                                                    "gray"
                                            }}
                                        >
                                            Loading enrollments...
                                        </td>

                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </div>


                    {/* ================= INFORMATION ================= */}

                    <div className="section">

                        <h2>
                            Enrollment Management
                        </h2>


                        <p
                            style={{
                                color: "#555",
                                lineHeight: "28px"
                            }}
                        >
                            Pending enrollment requests can be
                            approved or rejected using the action
                            buttons in the table. Approved or
                            rejected requests can also be returned
                            to pending status when required.
                        </p>

                    </div>


                    {/* ================= BACK ================= */}

                    <div
                        style={{
                            textAlign: "center",
                            marginBottom: "30px"
                        }}
                    >

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/admin-dashboard"
                                )
                            }
                            style={{
                                padding: "13px 25px",
                                background: "#2563EB",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            ← Back to Admin Dashboard
                        </button>

                    </div>

                </div>

            </PageShell>


            <LegacyScript
                src="/legacy/js/manage_enrollment.js"
            />

        </>
    );
}