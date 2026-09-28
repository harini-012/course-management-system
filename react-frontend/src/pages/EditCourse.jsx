import {
    useNavigate
} from "react-router-dom";

import PageShell
    from "../components/PageShell";

import PageCss
    from "../components/PageCss";

import LegacyScript
    from "../components/LegacyScript";


export default function EditCourse() {

    const navigate =
        useNavigate();


    return (

        <>

            {/* IMPORTANT:
                Your actual CSS filename is edit_courses.css
            */}

            <PageCss
                href="/css/edit_courses.css"
            />


            <PageShell
                variant="admin"
            >

                <div className="container">

                    {/* ================= BANNER ================= */}

                    <div className="banner">

                        <h1>
                            Edit Course
                        </h1>

                        <p>
                            Update course information, learning
                            modules, videos, study materials and
                            other course details.
                        </p>

                    </div>


                    {/* ================= FORM ================= */}

                    <form id="editCourseForm">

                        {/* ================= BASIC INFORMATION ================= */}

                        <div className="section">

                            <h2>
                                Basic Course Information
                            </h2>


                            <div className="form-grid">

                                <div className="input-box">

                                    <label htmlFor="courseTitle">
                                        Course Title
                                    </label>

                                    <input
                                        type="text"
                                        id="courseTitle"
                                        placeholder="Enter course title"
                                        required
                                    />

                                </div>


                                <div className="input-box">

                                    <label htmlFor="instructor">
                                        Instructor
                                    </label>

                                    <input
                                        type="text"
                                        id="instructor"
                                        placeholder="Enter instructor name"
                                        required
                                    />

                                </div>


                                <div className="input-box">

                                    <label htmlFor="duration">
                                        Duration
                                    </label>

                                    <input
                                        type="text"
                                        id="duration"
                                        placeholder="Example: 8 Weeks"
                                        required
                                    />

                                </div>


                                <div className="input-box">

                                    <label htmlFor="level">
                                        Level
                                    </label>

                                    <select
                                        id="level"
                                        defaultValue=""
                                        required
                                    >

                                        <option value="">
                                            Select Level
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

                                    <label htmlFor="mode">
                                        Mode
                                    </label>

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

                                    <label htmlFor="status">
                                        Status
                                    </label>

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

                                    <label htmlFor="courseImage">
                                        Course Image URL
                                    </label>

                                    <input
                                        type="text"
                                        id="courseImage"
                                        placeholder="Enter image URL"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* ================= OVERVIEW ================= */}

                        <div className="section">

                            <h2>
                                Course Overview
                            </h2>


                            <div className="input-box">

                                <label htmlFor="overview">
                                    Short Overview
                                </label>

                                <textarea
                                    id="overview"
                                    placeholder="Enter short course overview"
                                ></textarea>

                            </div>

                        </div>


                        {/* ================= DESCRIPTION ================= */}

                        <div className="section">

                            <h2>
                                Course Description
                            </h2>


                            <div className="input-box">

                                <label htmlFor="description">
                                    Full Description
                                </label>

                                <textarea
                                    id="description"
                                    placeholder="Enter complete course description"
                                ></textarea>

                            </div>

                        </div>


                        {/* ================= MODULES ================= */}

                        <div className="section">

                            <h2>
                                Course Modules
                            </h2>

                            <div className="input-box">

                                <label htmlFor="modules">
                                    Modules
                                </label>

                                <textarea
                                    id="modules"
                                    placeholder={
                                        "Enter one module per line\nExample:\nIntroduction\nVariables and Data Types\nFunctions"
                                    }
                                ></textarea>

                            </div>

                        </div>


                        {/* ================= SYLLABUS ================= */}

                        <div className="section">

                            <h2>
                                Course Syllabus
                            </h2>

                            <div className="input-box">

                                <label htmlFor="syllabus">
                                    Syllabus
                                </label>

                                <textarea
                                    id="syllabus"
                                    placeholder="Enter one syllabus topic per line"
                                ></textarea>

                            </div>

                        </div>


                        {/* ================= SKILLS ================= */}

                        <div className="section">

                            <h2>
                                Skills You'll Gain
                            </h2>

                            <div className="input-box">

                                <label htmlFor="skills">
                                    Skills
                                </label>

                                <textarea
                                    id="skills"
                                    placeholder="Enter one skill per line"
                                ></textarea>

                            </div>

                        </div>


                        {/* ================= OUTCOMES ================= */}

                        <div className="section">

                            <h2>
                                Learning Outcomes
                            </h2>

                            <div className="input-box">

                                <label htmlFor="outcomes">
                                    Outcomes
                                </label>

                                <textarea
                                    id="outcomes"
                                    placeholder="Enter one learning outcome per line"
                                ></textarea>

                            </div>

                        </div>


                        {/* ================= PREREQUISITES ================= */}

                        <div className="section">

                            <h2>
                                Prerequisites
                            </h2>

                            <div className="input-box">

                                <label htmlFor="prerequisites">
                                    Prerequisites
                                </label>

                                <textarea
                                    id="prerequisites"
                                    placeholder="Enter one prerequisite per line"
                                ></textarea>

                            </div>

                        </div>


                        {/* ================= INSTRUCTOR ================= */}

                        <div className="section">

                            <h2>
                                Instructor Information
                            </h2>

                            <div className="input-box">

                                <label htmlFor="instructorInfo">
                                    Instructor Profile
                                </label>

                                <textarea
                                    id="instructorInfo"
                                    placeholder="Enter instructor experience and profile"
                                ></textarea>

                            </div>

                        </div>


                        {/* ================= VIDEOS ================= */}

                        <div className="section">

                            <h2>
                                Video Lessons
                            </h2>

                            <div className="input-box">

                                <label htmlFor="videos">
                                    Videos
                                </label>

                                <textarea
                                    id="videos"
                                    placeholder={
                                        "Enter one video per line\nExample:\nIntroduction | https://www.youtube.com/watch?v=VIDEO_ID"
                                    }
                                ></textarea>

                            </div>

                        </div>


                        {/* ================= MATERIALS ================= */}

                        <div className="section">

                            <h2>
                                Study Materials
                            </h2>

                            <div className="input-box">

                                <label htmlFor="materials">
                                    Materials
                                </label>

                                <textarea
                                    id="materials"
                                    placeholder={
                                        "Enter one material per line\nExample:\nPython Documentation | https://docs.python.org/"
                                    }
                                ></textarea>

                            </div>

                        </div>


                        {/* ================= BUTTONS ================= */}

                        <div
                            className="section"
                            style={{
                                textAlign: "center"
                            }}
                        >

                            <button
                                type="submit"
                                className="edit-btn"
                                style={{
                                    marginRight: "15px"
                                }}
                            >
                                Update Course
                            </button>


                            <button
                                type="button"
                                className="edit-btn"
                                style={{
                                    background: "#64748B"
                                }}
                                onClick={() =>
                                    navigate(
                                        "/admin-dashboard"
                                    )
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </div>

            </PageShell>


            <LegacyScript
                src="/legacy/js/edit_course.js"
            />

        </>
    );
}