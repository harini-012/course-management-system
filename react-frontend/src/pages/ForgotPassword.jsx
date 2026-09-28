import {
    Link
} from "react-router-dom";

import PageCss
    from "../components/PageCss";

import LegacyScript
    from "../components/LegacyScript";


export default function ForgotPassword() {

    return (

        <>

            <PageCss
                href="/css/forgot_password.css"
            />


            <div className="container">

                {/* ================= IMAGE ================= */}

                <div className="left">

                    <img
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop"
                        alt="Forgot password"
                    />

                </div>


                {/* ================= FORM ================= */}

                <div className="right">

                    <h2>
                        Forgot Password
                    </h2>


                    <p>
                        Select your account type and enter
                        your registered email address.
                    </p>


                    {/* ================= MESSAGE ================= */}

                    <div
                        id="message"
                        role="status"
                        aria-live="polite"
                        style={{
                            display: "none",
                            marginBottom: "15px",
                            fontWeight: "600"
                        }}
                    />


                    <form
                        id="forgotPasswordForm"
                    >

                        {/* ================= ROLE ================= */}

                        <div className="input-box">

                            <label>
                                Account Type
                            </label>


                            <div className="role-selector">

                                <label className="role-option">

                                    <input
                                        type="radio"
                                        name="role"
                                        value="student"
                                        defaultChecked
                                    />

                                    <span>
                                        Student
                                    </span>

                                </label>


                                <label className="role-option">

                                    <input
                                        type="radio"
                                        name="role"
                                        value="admin"
                                    />

                                    <span>
                                        Admin
                                    </span>

                                </label>

                            </div>

                        </div>


                        {/* ================= EMAIL ================= */}

                        <div className="input-box">

                            <label htmlFor="email">
                                Email Address
                            </label>


                            <input
                                type="email"
                                id="email"
                                placeholder="Enter Registered Email"
                                autoComplete="email"
                                required
                            />

                        </div>


                        {/* ================= BUTTON ================= */}

                        <button
                            type="submit"
                            id="resetBtn"
                        >
                            Reset Password
                        </button>

                    </form>


                    <div className="back">

                        <Link to="/login">
                            ← Back to Login
                        </Link>

                    </div>

                </div>

            </div>


            <LegacyScript
                src="/legacy/js/forgot_password.js"
            />

        </>
    );
}