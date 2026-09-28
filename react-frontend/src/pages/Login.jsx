import {
    Link
} from "react-router-dom";

import PageCss
    from "../components/PageCss";

import LegacyScript
    from "../components/LegacyScript";


export default function Login() {

    return (

        <>

            <PageCss
                href="/css/login.css"
            />


            <div className="container">

                <Link
                    to="/"
                    className="back-btn"
                >
                    ← Back to Home
                </Link>


                <h2>
                    LOGIN PORTAL
                </h2>


                {/* ================= ROLE TABS ================= */}

                <div className="tabs">

                    <button
                        className="active"
                        id="studentBtn"
                        type="button"
                    >
                        🎓 Student
                    </button>


                    <button
                        id="adminBtn"
                        type="button"
                    >
                        👨‍💼 Admin
                    </button>

                </div>


                <p
                    className="role-text"
                    id="role"
                >
                    Student Login
                </p>


                {/* ================= LOGIN FORM ================= */}

                <form
                    id="loginForm"
                    onSubmit={
                        event =>
                            event.preventDefault()
                    }
                >

                    <div className="input-box">

                        <label htmlFor="email">
                            Email
                        </label>


                        <input
                            type="email"
                            placeholder="Enter Email"
                            id="email"
                            autoComplete="email"
                        />

                    </div>


                    <div className="input-box">

                        <label htmlFor="password">
                            Password
                        </label>


                        <input
                            type="password"
                            placeholder="Enter Password"
                            id="password"
                            autoComplete="current-password"
                        />

                    </div>


                    <div
                        style={{
                            textAlign: "right",
                            marginTop: "-8px",
                            marginBottom: "20px"
                        }}
                    >

                        <Link
                            to="/forgot-password"
                            style={{
                                color: "#2563EB",
                                textDecoration: "none",
                                fontSize: "14px",
                                fontWeight: "bold"
                            }}
                        >
                            Forgot Password?
                        </Link>

                    </div>


                    <button
                        type="button"
                        className="login-btn"
                        id="loginBtn"
                    >
                        Login
                    </button>

                </form>


                {/* ================= REGISTER ================= */}

                <div className="register">

                    <h3 id="registerTitle">
                        New Student?
                    </h3>


                    <p id="registerText">
                        Don't have a student account?
                    </p>


                    {/*
                        Keep this as <a>, not <Link>.

                        login.js changes href depending on whether
                        Student or Admin login is selected.
                    */}

                    <a
                        href="/register"
                        id="registerLink"
                    >
                        Student Register
                    </a>

                </div>

            </div>


            <LegacyScript
                src="/legacy/js/login.js"
            />

        </>
    );
}