import {
    Link
} from "react-router-dom";

import PageCss
    from "../components/PageCss";

import LegacyScript
    from "../components/LegacyScript";


export default function ResetPassword() {

    return (

        <>

            <PageCss
                href="/css/reset_password.css"
            />


            <div className="container">

                {/* ================= IMAGE ================= */}

                <div className="left">

                    <img
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop"
                        alt="Reset Password"
                    />

                </div>


                {/* ================= FORM ================= */}

                <div className="right">

                    <h2>
                        Reset Password
                    </h2>


                    <p>
                        Create a new password for your account.
                        Make sure your password is strong and
                        easy to remember.
                    </p>


                    {/* ================= ACCOUNT ================= */}

                    <p
                        style={{
                            marginBottom: "15px"
                        }}
                    >

                        Account:

                        {" "}

                        <strong
                            id="resetEmailDisplay"
                        >
                            Loading...
                        </strong>

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
                        id="resetPasswordForm"
                    >

                        {/* ================= NEW PASSWORD ================= */}

                        <div className="input-box">

                            <label htmlFor="newPassword">
                                New Password
                            </label>


                            <input
                                type="password"
                                id="newPassword"
                                placeholder="Enter New Password"
                                autoComplete="new-password"
                                required
                            />

                        </div>


                        {/* ================= PASSWORD STRENGTH ================= */}

                        <div
                            id="passwordStrength"
                            style={{
                                marginTop: "-8px",
                                marginBottom: "15px",
                                fontSize: "14px",
                                fontWeight: "600"
                            }}
                        />


                        {/* ================= CONFIRM PASSWORD ================= */}

                        <div className="input-box">

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>


                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="Confirm New Password"
                                autoComplete="new-password"
                                required
                            />

                        </div>


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
                src="/legacy/js/reset_password.js"
            />

        </>
    );
}