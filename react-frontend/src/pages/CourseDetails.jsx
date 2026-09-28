import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import PageShell
    from "../components/PageShell";

import PageCss
    from "../components/PageCss";

import LegacyScript
    from "../components/LegacyScript";


const API_URL =
    "http://localhost:5000";


export default function CourseDetails() {

    const {
        courseKey
    } = useParams();


    const navigate =
        useNavigate();


    const [
        ready,
        setReady
    ] = useState(
        !courseKey
    );


    //=================================================
    // SYNCHRONIZE URL COURSE WITH APP STATE
    //=================================================

    useEffect(
        () => {

            if (!courseKey) {

                setReady(
                    true
                );

                return;
            }


            let cancelled =
                false;


            async function saveSelectedCourse() {

                try {

                    setReady(
                        false
                    );


                    const response =
                        await fetch(
                            `${API_URL}/appState/current`,
                            {
                                method:
                                    "PATCH",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        selectedCourseKey:
                                            decodeURIComponent(
                                                courseKey
                                            )
                                    })
                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            "Unable to save selected course."
                        );
                    }

                }

                catch (error) {

                    console.error(
                        "Course Selection Error:",
                        error
                    );

                }

                finally {

                    if (!cancelled) {

                        setReady(
                            true
                        );
                    }
                }
            }


            saveSelectedCourse();


            return () => {

                cancelled =
                    true;
            };

        },
        [courseKey]
    );


    return (

        <>

            <PageCss
                href="/css/course_details.css"
            />


            <PageShell
                variant="student3"
            >

                <div className="container">

                    {/* ================= HERO ================= */}

                    <div className="hero">

                        <div className="hero-content">

                            <h1 id="title">
                                Course Name
                            </h1>


                            <p id="overview">
                                Course overview will appear here
                                after selecting a course.
                            </p>

                        </div>


                        <div className="hero-image">

                            <img
                                id="courseImage"
                                src=""
                                alt="Course"
                            />

                        </div>

                    </div>


                    {/* ================= COURSE INFO ================= */}

                    <div className="info-grid">

                        <div className="info-card">

                            <h3>
                                Duration
                            </h3>

                            <p id="duration"></p>

                        </div>


                        <div className="info-card">

                            <h3>
                                Instructor
                            </h3>

                            <p id="instructor"></p>

                        </div>


                        <div className="info-card">

                            <h3>
                                Level
                            </h3>

                            <p id="level"></p>

                        </div>


                        <div className="info-card">

                            <h3>
                                Mode
                            </h3>

                            <p id="mode"></p>

                        </div>

                    </div>


                    {/* ================= OVERVIEW ================= */}

                    <div className="section">

                        <h2>
                            Course Overview
                        </h2>


                        <p id="courseDescription">
                            The complete course description
                            will be displayed here based on the
                            selected course.
                        </p>

                    </div>


                    {/* ================= MODULES ================= */}

                    <div className="section">

                        <h2>
                            Course Modules
                        </h2>


                        <p>
                            The course syllabus is divided into
                            multiple structured modules, allowing
                            learners to progress from foundational
                            concepts to advanced applications.
                        </p>


                        <div
                            id="modules"
                            className="grid"
                        ></div>

                    </div>


                    {/* ================= SKILLS ================= */}

                    <div className="section">

                        <h2>
                            Skills You'll Gain
                        </h2>


                        <p>
                            After completing this course
                            successfully, learners will develop
                            technical knowledge and practical
                            skills that can be applied in
                            real-world projects.
                        </p>


                        <div
                            id="skills"
                            className="grid"
                        ></div>

                    </div>


                    {/* ================= OUTCOMES ================= */}

                    <div className="section">

                        <h2>
                            Learning Outcomes
                        </h2>


                        <p>
                            Upon successful completion of this
                            course, students will be able to
                            apply theoretical concepts, solve
                            practical problems, and build
                            industry-level applications.
                        </p>


                        <div
                            id="outcomes"
                            className="grid"
                        ></div>

                    </div>


                    {/* ================= PREREQUISITES ================= */}

                    <div className="section">

                        <h2>
                            Prerequisites
                        </h2>


                        <p>
                            Although this course is designed for
                            learners of all levels, having some
                            basic knowledge related to the
                            subject will help you understand
                            concepts more efficiently.
                        </p>


                        <div
                            id="prerequisites"
                            className="grid"
                        ></div>

                    </div>


                    {/* ================= FEATURES ================= */}

                    <div className="section">

                        <h2>
                            Course Features
                        </h2>


                        <p>
                            This course has been carefully
                            designed to provide a practical,
                            interactive and industry-oriented
                            learning experience.
                        </p>


                        <div className="grid">

                            <div className="skill-card">

                                <h3>
                                    📚 Structured Learning
                                </h3>

                                <p>
                                    Well-organized modules covering
                                    concepts step by step from
                                    beginner to advanced level.
                                </p>

                            </div>


                            <div className="skill-card">

                                <h3>
                                    💡 Practical Examples
                                </h3>

                                <p>
                                    Real-world examples and
                                    demonstrations to improve
                                    conceptual understanding.
                                </p>

                            </div>


                            <div className="skill-card">

                                <h3>
                                    📝 Assignments
                                </h3>

                                <p>
                                    Hands-on practice exercises and
                                    assignments to reinforce learning.
                                </p>

                            </div>


                            <div className="skill-card">

                                <h3>
                                    🎯 Industry Ready
                                </h3>

                                <p>
                                    Course content follows current
                                    industry standards and best
                                    practices.
                                </p>

                            </div>


                            <div className="skill-card">

                                <h3>
                                    📈 Progress Tracking
                                </h3>

                                <p>
                                    Track your learning progress
                                    after enrolling in the course.
                                </p>

                            </div>


                            <div className="skill-card">

                                <h3>
                                    🏆 Certificate
                                </h3>

                                <p>
                                    Receive a certificate after
                                    successfully completing the
                                    course.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ================= INSTRUCTOR ================= */}

                    <div className="section">

                        <h2>
                            Instructor Information
                        </h2>


                        <div
                            style={{
                                background: "#F8FAFC",
                                padding: "25px",
                                borderLeft:
                                    "6px solid #2563EB",
                                borderRadius: "15px"
                            }}
                        >

                            <h3
                                id="instructorName"
                                style={{
                                    color: "#1E3A8A",
                                    marginBottom: "15px"
                                }}
                            >
                                Instructor Name
                            </h3>


                            <p
                                id="instructorInfo"
                                style={{
                                    lineHeight: "30px"
                                }}
                            >
                                Instructor profile and
                                professional experience will
                                be displayed here.
                            </p>

                        </div>

                    </div>


                    {/* ================= REVIEWS ================= */}

                    <div className="section">

                        <h2>
                            Student Reviews
                        </h2>


                        <p>
                            Students who complete this course
                            can share their feedback and
                            learning experience here.
                        </p>


                        <div className="grid">

                            <div className="skill-card">

                                <h3>
                                    ⭐⭐⭐⭐⭐ Excellent Learning Experience
                                </h3>

                                <p>
                                    Student reviews and ratings
                                    will appear here.
                                </p>

                            </div>


                            <div className="skill-card">

                                <h3>
                                    ⭐⭐⭐⭐⭐ Practical Knowledge
                                </h3>

                                <p>
                                    Course feedback from enrolled
                                    learners will be displayed here.
                                </p>

                            </div>


                            <div className="skill-card">

                                <h3>
                                    ⭐⭐⭐⭐⭐ Recommended Course
                                </h3>

                                <p>
                                    Verified student reviews will
                                    be shown after course completion.
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ================= ACTIONS ================= */}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "20px",
                            flexWrap: "wrap",
                            margin: "40px 0"
                        }}
                    >

                        <button
                            type="button"
                            className="enroll-btn"
                            onClick={() => {

                                if (
                                    typeof window.enrollCourse ===
                                    "function"
                                ) {

                                    window.enrollCourse();
                                }
                            }}
                        >
                            Enroll Now
                        </button>


                        <button
                            type="button"
                            className="back-btn"
                            onClick={() =>
                                navigate(
                                    "/courses"
                                )
                            }
                        >
                            Back to Courses
                        </button>

                    </div>

                </div>

            </PageShell>


            {ready && (

                <LegacyScript
                    src="/legacy/js/course_details.js"
                />

            )}

        </>
    );
}