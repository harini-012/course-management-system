import PageShell from "../components/PageShell";
import PageCss from "../components/PageCss";
import LegacyScript from "../components/LegacyScript";

export default function StartCourse() {

    return (
        <>
            <PageCss href="/css/start_course.css" />

            <PageShell variant="student3">

                <main className="learning-page">

                    {/* =====================================================
                        COURSE HEADER
                    ===================================================== */}

                    <section className="course-learning-header">

                        <span className="learning-tag">
                            MY LEARNING
                        </span>

                        <h1 id="courseTitle">
                            Course
                        </h1>

                        <p id="courseDescription">
                            Start learning and complete each lesson.
                        </p>


                        <div className="course-meta">

                            <div>
                                <span>Instructor</span>

                                <strong id="instructor">
                                    -
                                </strong>
                            </div>


                            <div>
                                <span>Duration</span>

                                <strong id="duration">
                                    -
                                </strong>
                            </div>


                            <div>
                                <span>Course</span>

                                <strong id="courseName">
                                    -
                                </strong>
                            </div>

                        </div>

                    </section>


                    {/* =====================================================
                        PROGRESS
                    ===================================================== */}

                    <section className="learning-card progress-card">

                        <div className="learning-card-title">

                            <div>

                                <span className="small-label">
                                    COURSE PROGRESS
                                </span>

                                <h2>
                                    Your Progress
                                </h2>

                            </div>


                            <strong id="progressText">
                                0% Completed
                            </strong>

                        </div>


                        <div className="progress-track">

                            <div
                                id="progressBar"
                                className="progress-fill"
                            ></div>

                        </div>

                    </section>


                    {/* =====================================================
                        VIDEO LESSONS
                    ===================================================== */}

                    <section className="learning-card">

                        <div className="learning-card-title">

                            <div>

                                <span className="small-label">
                                    VIDEO LESSONS
                                </span>

                                <h2>
                                    Course Lessons
                                </h2>

                            </div>

                        </div>


                        <div className="lesson-layout">

                            {/* LESSON LIST */}

                            <div className="lesson-sidebar">

                                <div id="videoList">
                                    Loading lessons...
                                </div>

                            </div>


                            {/* VIDEO PLAYER */}

                            <div className="video-player-area">

                                <span className="small-label">
                                    NOW PLAYING
                                </span>

                                <h2 id="videoTitle">
                                    Select a lesson
                                </h2>


                                {/* YOUTUBE / EMBED VIDEO */}

                                <iframe
                                    id="videoFrame"
                                    title="Course Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>


                                {/* NORMAL VIDEO */}

                                <video
                                    id="courseVideo"
                                    controls
                                ></video>


                                {/* VIDEO CONTROLS */}

                                <div className="video-controls">

                                    <button
                                        id="previousBtn"
                                        type="button"
                                        className="secondary-learning-btn"
                                    >
                                        ← Previous
                                    </button>


                                    <button
                                        id="completeLessonBtn"
                                        type="button"
                                        className="complete-lesson-btn"
                                    >
                                        ✓ Mark Lesson Complete
                                    </button>


                                    <button
                                        id="nextBtn"
                                        type="button"
                                        className="primary-learning-btn"
                                    >
                                        Next →
                                    </button>

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =====================================================
                        STUDY MATERIALS
                    ===================================================== */}

                    <section className="learning-card">

                        <div className="learning-card-title">

                            <div>

                                <span className="small-label">
                                    RESOURCES
                                </span>

                                <h2>
                                    Study Materials
                                </h2>

                                <p>
                                    Open the learning resources
                                    provided by your instructor.
                                </p>

                            </div>

                        </div>


                        <div
                            id="materialsList"
                            className="materials-list"
                        >
                            Loading study materials...
                        </div>

                    </section>


                    {/* =====================================================
                        CERTIFICATE
                    ===================================================== */}

                    <section className="learning-card certificate-unlock">

                        <div>

                            <span className="small-label">
                                COURSE COMPLETION
                            </span>

                            <h2>
                                Certificate
                            </h2>

                            <p id="certificateMessage">
                                Complete every video lesson to
                                unlock your certificate.
                            </p>

                        </div>


                        <button
                            id="certificateBtn"
                            type="button"
                            className="certificate-btn"
                            disabled
                        >
                            Complete Course to Unlock Certificate
                        </button>

                    </section>

                </main>

            </PageShell>


            <LegacyScript src="/legacy/js/start_course.js" />

        </>
    );
}