import PageShell from "../components/PageShell";
import PageCss from "../components/PageCss";
import LegacyScript from "../components/LegacyScript";

export default function Certificate() {

    return (
        <>
            <PageCss href="/css/certificate.css" />

            <PageShell variant="cert">

                <main className="certificate-page">

                    <section className="certificate">

                        <div className="certificate-border">

                            <div className="certificate-brand">
                                CourseMS
                            </div>

                            <div className="certificate-small-title">
                                CERTIFICATE OF COMPLETION
                            </div>

                            <h1>
                                Certificate
                            </h1>


                            <p className="presented">
                                This certificate is proudly
                                presented to
                            </p>


                            <h2
                                id="studentName"
                                className="certificate-student"
                            >
                                Student Name
                            </h2>


                            <div className="student-line"></div>


                            <p className="presented">
                                for successfully completing
                                the course
                            </p>


                            <h3
                                id="courseName"
                                className="certificate-course"
                            >
                                Course Name
                            </h3>


                            <div className="certificate-info">

                                <div>
                                    <span>
                                        Completion Date
                                    </span>

                                    <strong id="completionDate">
                                        -
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Certificate ID
                                    </span>

                                    <strong id="certificateId">
                                        -
                                    </strong>
                                </div>

                            </div>


                            <div className="certificate-footer">

                                <div className="signature">

                                    <strong id="instructorName">
                                        Instructor
                                    </strong>

                                    <span>
                                        Course Instructor
                                    </span>

                                </div>


                                <div className="certificate-seal">
                                    ✓
                                </div>


                                <div className="signature">

                                    <strong>
                                        CourseMS
                                    </strong>

                                    <span>
                                        Authorized Certificate
                                    </span>

                                </div>

                            </div>

                        </div>

                    </section>


                    <div className="certificate-actions">

                        <button
                            id="downloadBtn"
                            type="button"
                            className="download-btn"
                        >
                            Download / Save PDF
                        </button>

                        <button
                            id="printBtn"
                            type="button"
                            className="print-btn"
                        >
                            Print Certificate
                        </button>

                        <button
                            id="backBtn"
                            type="button"
                            className="back-btn"
                        >
                            Back to My Courses
                        </button>

                    </div>

                </main>

            </PageShell>


            <LegacyScript src="/legacy/js/certificate.js" />

        </>
    );
}