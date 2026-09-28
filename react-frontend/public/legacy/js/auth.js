//=====================================================
// AUTHENTICATION
// auth.js
// MOCK API VERSION
//=====================================================

import {
    queryData,
    patchData,
    getSession,
    clearSessions,
    createSession,
    getById
} from "./api.js";


//=====================================================
// AUTHENTICATE USER
//=====================================================

export async function loginUser(
    role,
    email,
    password
) {

    try {

        //---------------------------------------------
        // NORMALIZE VALUES
        //---------------------------------------------

        const normalizedRole =
            role === "admin"
                ? "admin"
                : "student";


        const normalizedEmail =
            String(email || "")
                .trim()
                .toLowerCase();


        const normalizedPassword =
            String(password || "");


        //---------------------------------------------
        // SELECT COLLECTION
        //---------------------------------------------

        const resource =
            normalizedRole === "admin"
                ? "admins"
                : "students";


        //---------------------------------------------
        // SEARCH USER FROM MOCK API
        //---------------------------------------------

        const users =
            await queryData(
                resource,
                {
                    email:
                        normalizedEmail,

                    password:
                        normalizedPassword
                }
            );


        //---------------------------------------------
        // INVALID LOGIN
        //---------------------------------------------

        if (
            !Array.isArray(users) ||
            users.length === 0
        ) {

            return {

                success:
                    false,

                message:
                    normalizedRole === "admin"
                        ? "Invalid Administrator Email or Password."
                        : "Invalid Student Email or Password."

            };
        }


        //---------------------------------------------
        // USER FOUND
        //---------------------------------------------

        const user =
            users[0];


        //---------------------------------------------
        // CHECK ACTIVE STATUS
        //---------------------------------------------

        if (
            user.active === false
        ) {

            return {

                success:
                    false,

                message:
                    "Your account is inactive."

            };
        }


        //---------------------------------------------
        // CHECK USER ID
        //---------------------------------------------

        if (
            user.id === undefined ||
            user.id === null ||
            user.id === ""
        ) {

            console.error(
                "User does not have a valid API ID:",
                user
            );


            return {

                success:
                    false,

                message:
                    "Unable to login. Invalid user record."

            };
        }


        //---------------------------------------------
        // CREATE SESSION
        //---------------------------------------------

        const session =
            await createSession({

                role:
                    normalizedRole,

                userId:
                    user.id,

                email:
                    user.email,

                name:
                    normalizedRole === "admin"
                        ? (
                            user.adminName ||
                            user.name ||
                            ""
                        )
                        : (
                            user.studentName ||
                            user.name ||
                            ""
                        )

            });


        //---------------------------------------------
        // UPDATE LAST LOGIN
        //---------------------------------------------

        try {

            await patchData(
                resource,
                user.id,
                {
                    lastLogin:
                        new Date()
                            .toLocaleString()
                }
            );

        }

        catch (error) {

            console.error(
                "Unable to update last login:",
                error
            );

        }


        //---------------------------------------------
        // SUCCESS
        //---------------------------------------------

        return {

            success:
                true,

            message:
                normalizedRole === "admin"
                    ? "Administrator Login Successful."
                    : "Student Login Successful.",

            user:
                user,

            session:
                session

        };

    }

    catch (error) {

        console.error(
            "Authentication Error:",
            error
        );


        return {

            success:
                false,

            message:
                "Unable to login. Please try again."

        };
    }
}


//=====================================================
// AUTHENTICATE ALIAS
//=====================================================

export async function authenticate(
    role,
    email,
    password
) {

    return await loginUser(
        role,
        email,
        password
    );
}


//=====================================================
// GET LOGGED-IN USER
//=====================================================

export async function getLoggedInUser() {

    try {

        const session =
            await getSession();


        if (!session) {

            return null;
        }


        //---------------------------------------------
        // STUDENT
        //---------------------------------------------

        if (
            session.role === "student"
        ) {

            return await getById(
                "students",
                session.userId
            );
        }


        //---------------------------------------------
        // ADMIN
        //---------------------------------------------

        if (
            session.role === "admin"
        ) {

            return await getById(
                "admins",
                session.userId
            );
        }


        return null;

    }

    catch (error) {

        console.error(
            "Unable to get logged-in user:",
            error
        );


        return null;
    }
}


//=====================================================
// GET CURRENT ROLE
//=====================================================

export async function getCurrentRole() {

    try {

        const session =
            await getSession();


        if (!session) {

            return null;
        }


        return session.role || null;

    }

    catch (error) {

        console.error(
            "Unable to get current role:",
            error
        );


        return null;
    }
}


//=====================================================
// CHECK STUDENT LOGIN
//=====================================================

export async function isStudentLoggedIn() {

    try {

        const session =
            await getSession();


        return Boolean(
            session &&
            session.role === "student"
        );

    }

    catch (error) {

        return false;
    }
}


//=====================================================
// CHECK ADMIN LOGIN
//=====================================================

export async function isAdminLoggedIn() {

    try {

        const session =
            await getSession();


        return Boolean(
            session &&
            session.role === "admin"
        );

    }

    catch (error) {

        return false;
    }
}


//=====================================================
// LOGOUT
//=====================================================

export async function logoutUser() {

    try {

        await clearSessions();


        return {

            success:
                true,

            message:
                "Logged Out Successfully."

        };

    }

    catch (error) {

        console.error(
            "Logout Error:",
            error
        );


        return {

            success:
                false,

            message:
                "Unable to logout."

        };
    }
}


//=====================================================
// REQUIRE STUDENT
//=====================================================

export async function requireStudent() {

    try {

        const session =
            await getSession();


        if (
            !session ||
            session.role !== "student"
        ) {

            window.location.replace(
                "/login"
            );


            return null;
        }


        //---------------------------------------------
        // VERIFY STUDENT STILL EXISTS
        //---------------------------------------------

        const student =
            await getById(
                "students",
                session.userId
            );


        if (!student) {

            await clearSessions();


            window.location.replace(
                "/login"
            );


            return null;
        }


        if (
            student.active === false
        ) {

            await clearSessions();


            window.location.replace(
                "/login"
            );


            return null;
        }


        return session;

    }

    catch (error) {

        console.error(
            "Student authentication check failed:",
            error
        );


        window.location.replace(
            "/login"
        );


        return null;
    }
}


//=====================================================
// REQUIRE ADMIN
//=====================================================

export async function requireAdmin() {

    try {

        const session =
            await getSession();


        if (
            !session ||
            session.role !== "admin"
        ) {

            window.location.replace(
                "/login"
            );


            return null;
        }


        //---------------------------------------------
        // VERIFY ADMIN STILL EXISTS
        //---------------------------------------------

        const admin =
            await getById(
                "admins",
                session.userId
            );


        if (!admin) {

            await clearSessions();


            window.location.replace(
                "/login"
            );


            return null;
        }


        if (
            admin.active === false
        ) {

            await clearSessions();


            window.location.replace(
                "/login"
            );


            return null;
        }


        return session;

    }

    catch (error) {

        console.error(
            "Administrator authentication check failed:",
            error
        );


        window.location.replace(
            "/login"
        );


        return null;
    }
}


//=====================================================
// GET CURRENT STUDENT USER
//=====================================================

export async function getStudentUser() {

    try {

        const session =
            await getSession();


        if (
            !session ||
            session.role !== "student"
        ) {

            return null;
        }


        return await getById(
            "students",
            session.userId
        );

    }

    catch (error) {

        console.error(
            "Unable to get student:",
            error
        );


        return null;
    }
}


//=====================================================
// GET CURRENT ADMIN USER
//=====================================================

export async function getAdminUser() {

    try {

        const session =
            await getSession();


        if (
            !session ||
            session.role !== "admin"
        ) {

            return null;
        }


        return await getById(
            "admins",
            session.userId
        );

    }

    catch (error) {

        console.error(
            "Unable to get administrator:",
            error
        );


        return null;
    }
}