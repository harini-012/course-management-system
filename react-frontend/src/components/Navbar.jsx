import {
    NavLink,
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../auth/AuthContext";


function Navbar({
    variant = "student"
}) {

    const navigate =
        useNavigate();


    const {
        logout
    } =
        useAuth();


    const isAdmin =
        variant === "admin" ||
        variant === "adminnone";


    async function handleLogout() {

        try {

            await logout(
                isAdmin
                    ? "admin"
                    : "student"
            );


            navigate(
                "/login",
                {
                    replace: true
                }
            );

        }

        catch (error) {

            console.error(
                "Logout Error:",
                error
            );


            navigate(
                "/login",
                {
                    replace: true
                }
            );
        }
    }


    return (

        <header>

            <div className="logo">

                {isAdmin
                    ? "CourseMS Admin"
                    : "CourseMS"}

            </div>


            <nav>

                {/* ================= HOME ================= */}

                {variant === "home" && (

                    <>

                        <NavLink to="/">
                            Home
                        </NavLink>


                        <NavLink to="/login">
                            Login
                        </NavLink>

                    </>

                )}


                {/* ================= STUDENT ================= */}

                {variant === "student" && (

                    <>

                        <NavLink to="/student-dashboard">
                            Dashboard
                        </NavLink>


                        <NavLink to="/courses">
                            Explore Courses
                        </NavLink>


                        <NavLink to="/my-courses">
                            My Courses
                        </NavLink>


                        <button
                            type="button"
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </>

                )}


                {/* ================= STUDENT FULL ================= */}

                {variant === "student3" && (

                    <>

                        <NavLink to="/student-dashboard">
                            Dashboard
                        </NavLink>


                        <NavLink to="/courses">
                            Explore Courses
                        </NavLink>


                        <NavLink to="/my-courses">
                            My Courses
                        </NavLink>


                        <button
                            type="button"
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </>

                )}


                {/* ================= CERTIFICATE ================= */}

                {variant === "cert" && (

                    <>

                        <NavLink to="/student-dashboard">
                            Dashboard
                        </NavLink>


                        <NavLink to="/courses">
                            Explore Courses
                        </NavLink>


                        <NavLink to="/my-courses">
                            My Courses
                        </NavLink>


                        <button
                            type="button"
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </>

                )}


                {/* ================= ENROLLMENT ================= */}

                {variant === "enrollment" && (

                    <>

                        <NavLink to="/student-dashboard">
                            Dashboard
                        </NavLink>


                        <NavLink to="/courses">
                            Explore Courses
                        </NavLink>


                        <NavLink to="/my-courses">
                            My Courses
                        </NavLink>


                        <button
                            type="button"
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </>

                )}


                {/* ================= ADMIN PAGES ================= */}

                {variant === "admin" && (

                    <>

                        <NavLink to="/admin-dashboard">
                            Dashboard
                        </NavLink>


                        <NavLink to="/add-course">
                            Add Course
                        </NavLink>


                        <NavLink to="/manage-enrollment">
                            Enrollments
                        </NavLink>


                        <button
                            type="button"
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </>

                )}


                {/* ================= ADMIN DASHBOARD ================= */}

                {variant === "adminnone" && (

                    <>

                        <NavLink to="/admin-dashboard">
                            Dashboard
                        </NavLink>


                        <NavLink to="/add-course">
                            Add Course
                        </NavLink>


                        <NavLink to="/manage-enrollment">
                            Enrollments
                        </NavLink>


                        <button
                            type="button"
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </>

                )}

            </nav>

        </header>
    );
}


export default Navbar;