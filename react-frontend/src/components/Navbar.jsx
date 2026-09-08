import {
    NavLink
} from "react-router-dom";


function Navbar({
    variant = "student"
}) {

    return (

        <header>

            <div className="logo">

                {variant.startsWith("admin")
                    ? "CourseMS Admin"
                    : "CourseMS"}

            </div>


            <nav>

                {/* HOME */}

                {variant === "home" && (

                    <>

                        <NavLink
                            to="/"
                            reloadDocument
                        >
                            Home
                        </NavLink>


                        <NavLink
                            to="/login"
                            reloadDocument
                        >
                            Login
                        </NavLink>


                        <button
                            id="logoutBtn"
                            className="logout-btn"
                            style={{
                                display: "none"
                            }}
                        >
                            Logout
                        </button>

                    </>

                )}


                {/* STUDENT */}

                {variant === "student" && (

                    <>

                        <NavLink
                            to="/courses"
                            reloadDocument
                        >
                            Explore Courses
                        </NavLink>


                        <NavLink
                            to="/my-courses"
                            reloadDocument
                        >
                            My Courses
                        </NavLink>


                        <button
                            id="logoutBtn"
                            className="logout-btn"
                        >
                            Logout
                        </button>

                    </>

                )}


                {/* STUDENT WITH DASHBOARD */}

                {variant === "student3" && (

                    <>

                        <NavLink
                            to="/dashboard"
                            reloadDocument
                        >
                            Dashboard
                        </NavLink>


                        <NavLink
                            to="/courses"
                            reloadDocument
                        >
                            Explore Courses
                        </NavLink>


                        <NavLink
                            to="/my-courses"
                            reloadDocument
                        >
                            My Courses
                        </NavLink>


                        <button
                            id="logoutBtn"
                            className="logout-btn"
                        >
                            Logout
                        </button>

                    </>

                )}


                {/* CERTIFICATE */}

                {variant === "cert" && (

                    <>

                        <NavLink
                            to="/dashboard"
                            reloadDocument
                        >
                            Dashboard
                        </NavLink>


                        <NavLink
                            to="/my-courses"
                            reloadDocument
                        >
                            My Courses
                        </NavLink>


                        <button
                            id="logoutBtn"
                            className="logout-btn"
                        >
                            Logout
                        </button>

                    </>

                )}


                {/* ENROLLMENT SUCCESS */}

                {variant === "enrollment" && (

                    <>

                        <NavLink
                            to="/courses"
                            reloadDocument
                        >
                            Explore Courses
                        </NavLink>


                        <NavLink
                            to="/dashboard"
                            reloadDocument
                        >
                            Dashboard
                        </NavLink>


                        <NavLink
                            to="/my-courses"
                            reloadDocument
                        >
                            My Courses
                        </NavLink>


                        <button
                            id="logoutBtn"
                            className="logout-btn"
                        >
                            Logout
                        </button>

                    </>

                )}


                {/* ADMIN */}

                {variant === "admin" && (

                    <>

                        <NavLink
                            to="/admin-dashboard"
                            reloadDocument
                        >
                            Dashboard
                        </NavLink>


                        <button
                            id="logoutBtn"
                            className="logout-btn"
                        >
                            Logout
                        </button>

                    </>

                )}


                {/* ADMIN DASHBOARD */}

                {variant === "adminnone" && (

                    <button
                        id="logoutBtn"
                        className="logout-btn"
                    >
                        Logout
                    </button>

                )}

            </nav>

        </header>

    );

}


export default Navbar;