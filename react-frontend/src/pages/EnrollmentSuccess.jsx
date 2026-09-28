import {
    Link
} from "react-router-dom";

import PageShell
    from "../components/PageShell";

import PageCss
    from "../components/PageCss";

import LegacyScript
    from "../components/LegacyScript";


export default function EnrollmentSuccess() {

    return (

        <>

            <PageCss
                href="/css/enrollment_success.css"
            />


            <PageShell
                variant="enrollment"
            >

                <div className="container">

                    <div className="success">
                        ✓
                    </div>


                    <h1>
                        Enrollment Successful!
                    </h1>


                    <p>
                        Congratulations! You have successfully
                        enrolled in the selected course.
                        Your enrollment has been confirmed and
                        you can now begin learning.
                    </p>


                    {/* ================= ENROLLMENT INFO ================= */}

                    <div className="info">

                        <div className="card">

                            <h3>
                                Course
                            </h3>

                            <p id="courseName">
                                Loading...
                            </p>

                        </div>


                        <div className="card">

                            <h3>
                                Enrollment Date
                            </h3>

                            <p id="enrollDate">
                                --
                            </p>

                        </div>


                        <div className="card">

                            <h3>
                                Student ID
                            </h3>

                            <p id="studentId">
                                --
                            </p>

                        </div>


                        <div className="card">

                            <h3>
                                Status
                            </h3>

                            <p
                                id="enrollmentStatus"
                                style={{
                                    color: "#16A34A",
                                    fontWeight: "bold"
                                }}
                            >
                                Successfully Enrolled
                            </p>

                        </div>

                    </div>


                    {/* ================= ACTIONS ================= */}

                    <div className="buttons">

                        <Link
                            to="/my-courses"
                            className="btn successBtn"
                        >
                            My Courses
                        </Link>


                        <Link
                            to="/courses"
                            className="btn primary"
                        >
                            Browse More Courses
                        </Link>


                        <Link
                            to="/student-dashboard"
                            className="btn secondary"
                        >
                            Student Dashboard
                        </Link>

                    </div>

                </div>

            </PageShell>


            <LegacyScript
                src="/legacy/js/enrollment_success.js"
            />

        </>
    );
}