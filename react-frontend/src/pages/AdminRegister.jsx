import {
    Link
} from "react-router-dom";

import PageCss
    from "../components/PageCss";

import LegacyScript
    from "../components/LegacyScript";


export default function AdminRegister() {

    return (

        <>

            <PageCss
                href="/css/admin_register.css"
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


                <h2>
                    Administrator Registration
                </h2>


                <form
                    id="adminRegisterForm"
                >

                    {/* ================= NAME ================= */}

                    <div className="input-box">

                        <label htmlFor="adminName">
                            Administrator Name
                        </label>


                        <input
                            type="text"
                            placeholder="Enter Full Name"
                            id="adminName"
                            autoComplete="name"
                            required
                        />

                    </div>


                    {/* ================= ADMIN ID ================= */}

                    <div className="input-box">

                        <label htmlFor="adminId">
                            Administrator ID
                        </label>


                        <input
                            type="text"
                            placeholder="Enter Administrator ID"
                            id="adminId"
                            autoComplete="off"
                            required
                        />

                    </div>


                    {/* ================= EMAIL ================= */}

                    <div className="input-box">

                        <label htmlFor="adminEmail">
                            Email Address
                        </label>


                        <input
                            type="email"
                            placeholder="Enter Email"
                            id="adminEmail"
                            autoComplete="email"
                            required
                        />

                    </div>


                    {/* ================= DESIGNATION ================= */}

                    <div className="input-box">

                        <label htmlFor="designation">
                            Designation
                        </label>


                        <select
                            id="designation"
                            required
                            defaultValue=""
                        >

                            <option value="">
                                Select Designation
                            </option>

                            <option value="Principal">
                                Principal
                            </option>

                            <option value="Head of Department (HOD)">
                                Head of Department (HOD)
                            </option>

                            <option value="Faculty">
                                Faculty
                            </option>

                            <option value="Course Coordinator">
                                Course Coordinator
                            </option>

                            <option value="System Administrator">
                                System Administrator
                            </option>

                        </select>

                    </div>


                    {/* ================= PASSWORD ================= */}

                    <div className="input-box">

                        <label htmlFor="adminPassword">
                            Password
                        </label>


                        <input
                            type="password"
                            placeholder="Create Password"
                            id="adminPassword"
                            autoComplete="new-password"
                            required
                        />

                    </div>


                    {/* ================= CONFIRM PASSWORD ================= */}

                    <div className="input-box">

                        <label htmlFor="adminConfirmPassword">
                            Confirm Password
                        </label>


                        <input
                            type="password"
                            placeholder="Confirm Password"
                            id="adminConfirmPassword"
                            autoComplete="new-password"
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        id="adminBtn"
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
                src="/legacy/js/admin_register.js"
            />

        </>
    );
}