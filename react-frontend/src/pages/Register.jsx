import {
    Link
} from "react-router-dom";

import PageCss
    from "../components/PageCss";

import LegacyScript
    from "../components/LegacyScript";


export default function Register() {

    return (

        <>

            <PageCss
                href="/css/student_register.css"
            />


            <div className="container">

                <Link
                    to="/"
                    className="back-btn"
                >
                    ← Back to Home
                </Link>


                <h2>
                    Student Registration
                </h2>


                <form
                    id="registerForm"
                >

                    {/* ================= NAME ================= */}

                    <div className="input-box">

                        <label htmlFor="studentName">
                            Student Name
                        </label>


                        <input
                            type="text"
                            placeholder="Enter Full Name"
                            id="studentName"
                            autoComplete="name"
                            required
                        />

                    </div>


                    {/* ================= STUDENT ID ================= */}

                    <div className="input-box">

                        <label htmlFor="studentId">
                            Student ID
                        </label>


                        <input
                            type="text"
                            placeholder="Enter Student ID"
                            id="studentId"
                            autoComplete="off"
                            required
                        />

                    </div>


                    {/* ================= EMAIL ================= */}

                    <div className="input-box">

                        <label htmlFor="studentEmail">
                            Email Address
                        </label>


                        <input
                            type="email"
                            placeholder="Enter Email"
                            id="studentEmail"
                            autoComplete="email"
                            required
                        />

                    </div>


                    {/* ================= DEPARTMENT ================= */}

                    <div className="input-box">

                        <label htmlFor="department">
                            Department
                        </label>


                        <select
                            id="department"
                            required
                            defaultValue=""
                        >

                            <option value="">
                                Select Department
                            </option>

                            <option value="Computer Science">
                                Computer Science
                            </option>

                            <option value="Information Technology">
                                Information Technology
                            </option>

                            <option value="Electronics & Communication">
                                Electronics & Communication
                            </option>

                            <option value="Electrical & Electronics">
                                Electrical & Electronics
                            </option>

                            <option value="Mechanical Engineering">
                                Mechanical Engineering
                            </option>

                            <option value="Civil Engineering">
                                Civil Engineering
                            </option>

                        </select>

                    </div>


                    {/* ================= PASSWORD ================= */}

                    <div className="input-box">

                        <label htmlFor="password">
                            Password
                        </label>


                        <input
                            type="password"
                            placeholder="Create Password"
                            id="password"
                            autoComplete="new-password"
                            required
                        />

                    </div>


                    {/* ================= CONFIRM PASSWORD ================= */}

                    <div className="input-box">

                        <label htmlFor="confirmPassword">
                            Confirm Password
                        </label>


                        <input
                            type="password"
                            placeholder="Confirm Password"
                            id="confirmPassword"
                            autoComplete="new-password"
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        id="registerBtn"
                    >
                        Register
                    </button>

                </form>


                <div className="login">

                    <p>
                        Already have an account?
                    </p>


                    <Link to="/login">
                        Login Here
                    </Link>

                </div>

            </div>


            <LegacyScript
                src="/legacy/js/student_register.js"
            />

        </>
    );
}