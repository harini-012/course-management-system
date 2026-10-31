import {
    Link
} from "react-router-dom";

import PageCss
    from "../components/PageCss";



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
    Forgot your password? Please contact your
    college administrator to reset your password.
</p>

<div
    className="input-box"
    style={{
        padding: "20px",
        backgroundColor: "#eff6ff",
        borderRadius: "10px",
        textAlign: "center",
        marginTop: "20px"
    }}
>
    <h3>Password Reset Assistance</h3>

    <p>
        Students who have forgotten their password
        should contact their college administrator.
    </p>

    <p>
        The administrator will verify your account
        and provide a temporary password.
    </p>
</div>


                    <div className="back">

                        <Link to="/login">
                            ← Back to Login
                        </Link>

                    </div>

                </div>

            </div>


            
        </>
    );
}