import { useNavigate } from "react-router-dom";

import PageShell from "../components/PageShell";
import PageCss from "../components/PageCss";
import LegacyScript from "../components/LegacyScript";

export default function AddCourse() {

    const navigate = useNavigate();

    return (
        <>
            <PageCss href="/css/add_course.css" />

            <PageShell variant="admin">

                <main className="add-course-page">

                    <section className="add-course-hero">

                        <div>
                            <span className="page-tag">
                                ADMIN • COURSE MANAGEMENT
                            </span>

                            <h1>Add New Course</h1>

                            <p>
                                Create a course, add modules,
                                syllabus, skills, video lessons
                                and study materials.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="back-dashboard-btn"
                            onClick={() =>
                                navigate("/admin-dashboard")
                            }
                        >
                            ← Back to Dashboard
                        </button>

                    </section>


                    <div
                        id="message"
                        className="form-message"
                        style={{ display: "none" }}
                    ></div>


                    <form
                        id="courseForm"
                        className="course-form"
                    >

                        {/* BASIC DETAILS */}

                        <section className="course-form-section">

                            <div className="section-title">

                                <span>01</span>

                                <div>
                                    <h2>Basic Information</h2>
                                    <p>
                                        Enter the main details of
                                        the course.
                                    </p>
                                </div>

                            </div>


                            <div className="form-grid">

                                <div className="input-box">
                                    <label>Course Title *</label>

                                    <input
                                        id="courseTitle"
                                        type="text"
                                        placeholder="Python Programming"
                                        required
                                    />
                                </div>


                                <div className="input-box">
                                    <label>Course Key</label>

                                    <input
                                        id="courseKey"
                                        type="text"
                                        placeholder="python"
                                    />

                                    <small>
                                        Leave empty to generate automatically.
                                    </small>
                                </div>


                                <div className="input-box">
                                    <label>Instructor *</label>

                                    <input
                                        id="instructor"
                                        type="text"
                                        placeholder="Instructor name"
                                        required
                                    />
                                </div>


                                <div className="input-box">
                                    <label>Duration *</label>

                                    <input
                                        id="duration"
                                        type="text"
                                        placeholder="8 Weeks"
                                        required
                                    />
                                </div>


                                <div className="input-box">
                                    <label>Level *</label>

                                    <select
                                        id="level"
                                        defaultValue=""
                                        required
                                    >
                                        <option value="">
                                            Select level
                                        </option>

                                        <option value="Beginner">
                                            Beginner
                                        </option>

                                        <option value="Intermediate">
                                            Intermediate
                                        </option>

                                        <option value="Advanced">
                                            Advanced
                                        </option>
                                    </select>
                                </div>


                                <div className="input-box">
                                    <label>Mode</label>

                                    <select
                                        id="mode"
                                        defaultValue="Online"
                                    >
                                        <option value="Online">
                                            Online
                                        </option>

                                        <option value="Offline">
                                            Offline
                                        </option>

                                        <option value="Hybrid">
                                            Hybrid
                                        </option>
                                    </select>
                                </div>


                                <div className="input-box">
                                    <label>Status</label>

                                    <select
                                        id="status"
                                        defaultValue="Active"
                                    >
                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="Inactive">
                                            Inactive
                                        </option>
                                    </select>
                                </div>


                                <div className="input-box">
                                    <label>Course Image URL</label>

                                    <input
                                        id="courseImage"
                                        type="url"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                            </div>

                        </section>


                        {/* DESCRIPTION */}

                        <section className="course-form-section">

                            <div className="section-title">

                                <span>02</span>

                                <div>
                                    <h2>Course Description</h2>
                                    <p>
                                        Explain what students will learn.
                                    </p>
                                </div>

                            </div>


                            <div className="input-box full-input">

                                <label>Short Overview</label>

                                <textarea
                                    id="overview"
                                    placeholder="Short introduction to the course"
                                ></textarea>

                            </div>


                            <div className="input-box full-input">

                                <label>Full Description</label>

                                <textarea
                                    id="description"
                                    placeholder="Complete course description"
                                ></textarea>

                            </div>

                        </section>


                        {/* MODULES */}

                        <section className="course-form-section">

                            <DynamicHeading
                                number="03"
                                title="Course Modules"
                                description="Add each course module separately."
                            />

                            <div
                                id="moduleContainer"
                                className="dynamic-container"
                            >
                                <DynamicInput
                                    className="moduleInput"
                                    placeholder="Example: Python Fundamentals"
                                />
                            </div>

                            <button
                                type="button"
                                id="addModuleBtn"
                                className="add-item-btn"
                            >
                                + Add Module
                            </button>

                        </section>


                        {/* SYLLABUS */}

                        <section className="course-form-section">

                            <DynamicHeading
                                number="04"
                                title="Course Syllabus"
                                description="Add syllabus topics separately."
                            />

                            <div
                                id="syllabusContainer"
                                className="dynamic-container"
                            >
                                <DynamicInput
                                    className="syllabusInput"
                                    placeholder="Example: Variables and Data Types"
                                />
                            </div>

                            <button
                                type="button"
                                id="addSyllabusBtn"
                                className="add-item-btn"
                            >
                                + Add Syllabus Topic
                            </button>

                        </section>


                        {/* SKILLS */}

                        <section className="course-form-section">

                            <DynamicHeading
                                number="05"
                                title="Skills"
                                description="What skills will students gain?"
                            />

                            <div
                                id="skillContainer"
                                className="dynamic-container"
                            >
                                <DynamicInput
                                    className="skillInput"
                                    placeholder="Example: Python Programming"
                                />
                            </div>

                            <button
                                type="button"
                                id="addSkillBtn"
                                className="add-item-btn"
                            >
                                + Add Skill
                            </button>

                        </section>


                        {/* OUTCOMES */}

                        <section className="course-form-section">

                            <DynamicHeading
                                number="06"
                                title="Learning Outcomes"
                                description="Add expected learning outcomes."
                            />

                            <div
                                id="outcomeContainer"
                                className="dynamic-container"
                            >
                                <DynamicInput
                                    className="outcomeInput"
                                    placeholder="Example: Build Python applications"
                                />
                            </div>

                            <button
                                type="button"
                                id="addOutcomeBtn"
                                className="add-item-btn"
                            >
                                + Add Outcome
                            </button>

                        </section>


                        {/* PREREQUISITES */}

                        <section className="course-form-section">

                            <DynamicHeading
                                number="07"
                                title="Prerequisites"
                                description="Add requirements for this course."
                            />

                            <div
                                id="prerequisiteContainer"
                                className="dynamic-container"
                            >
                                <DynamicInput
                                    className="prerequisiteInput"
                                    placeholder="Example: Basic computer knowledge"
                                />
                            </div>

                            <button
                                type="button"
                                id="addPrerequisiteBtn"
                                className="add-item-btn"
                            >
                                + Add Prerequisite
                            </button>

                        </section>


                        {/* INSTRUCTOR */}

                        <section className="course-form-section">

                            <DynamicHeading
                                number="08"
                                title="Instructor Information"
                                description="Add instructor profile information."
                            />

                            <div className="input-box full-input">

                                <textarea
                                    id="instructorInfo"
                                    placeholder="Instructor experience and profile"
                                ></textarea>

                            </div>

                        </section>


                        {/* VIDEOS */}

                        <section className="course-form-section">

                            <DynamicHeading
                                number="09"
                                title="Video Lessons"
                                description="Give every lesson a name and video URL."
                            />


                            <div
                                id="videoContainer"
                                className="video-fields"
                            >

                                <div className="video-field-row">

                                    <div className="input-box">
                                        <label>Lesson Name</label>

                                        <input
                                            type="text"
                                            className="videoTitleInput"
                                            placeholder="Introduction to Python"
                                        />
                                    </div>


                                    <div className="input-box">
                                        <label>Video URL</label>

                                        <input
                                            type="url"
                                            className="videoUrlInput"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                    </div>

                                </div>

                            </div>


                            <button
                                type="button"
                                id="addVideoBtn"
                                className="add-item-btn"
                            >
                                + Add Video Lesson
                            </button>

                        </section>


                        {/* MATERIALS */}

                        <section className="course-form-section">

                            <DynamicHeading
                                number="10"
                                title="Study Materials"
                                description="Add the material name and URL separately."
                            />


                            <div
                                id="materialContainer"
                                className="video-fields"
                            >

                                <div className="material-field-row">

                                    <div className="input-box">
                                        <label>Material Name</label>

                                        <input
                                            type="text"
                                            className="materialTitleInput"
                                            placeholder="Python Notes"
                                        />
                                    </div>


                                    <div className="input-box">
                                        <label>Material URL</label>

                                        <input
                                            type="url"
                                            className="materialUrlInput"
                                            placeholder="https://..."
                                        />
                                    </div>

                                </div>

                            </div>


                            <button
                                type="button"
                                id="addMaterialBtn"
                                className="add-item-btn"
                            >
                                + Add Study Material
                            </button>

                        </section>


                        {/* SAVE */}

                        <div className="form-actions">

                            <button
                                id="saveCourseBtn"
                                type="submit"
                                className="save-course-btn"
                            >
                                Add Course
                            </button>


                            <button
                                type="button"
                                className="cancel-course-btn"
                                onClick={() =>
                                    navigate("/admin-dashboard")
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </main>

            </PageShell>


            <LegacyScript src="/legacy/js/add_course.js" />

        </>
    );
}


function DynamicHeading({
    number,
    title,
    description
}) {

    return (
        <div className="section-title">

            <span>{number}</span>

            <div>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>

        </div>
    );
}


function DynamicInput({
    className,
    placeholder
}) {

    return (
        <div className="dynamic-row">

            <input
                type="text"
                className={className}
                placeholder={placeholder}
            />

        </div>
    );
}