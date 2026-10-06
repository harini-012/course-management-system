import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";


const AuthContext =
    createContext(null);


const API_URL =
    "http://localhost:3001/api";


//=====================================================
// AUTH PROVIDER
//=====================================================

export function AuthProvider({
    children
}) {

    const [
        loggedInStudent,
        setLoggedInStudent
    ] = useState(null);


    const [
        loggedInAdmin,
        setLoggedInAdmin
    ] = useState(null);


    const [
        authLoading,
        setAuthLoading
    ] = useState(true);


    //=================================================
    // GET CURRENT SESSION
    //=================================================

    async function getCurrentSession() {

        const response =
            await fetch(
                `${API_URL}/sessions`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load current session."
            );
        }


        const sessions =
            await response.json();


        if (
            !Array.isArray(sessions) ||
            sessions.length === 0
        ) {

            return null;
        }


        // JSON Server generates session IDs.
        // The application uses the latest session.

        return sessions[
            sessions.length - 1
        ];
    }


    //=================================================
    // DELETE ALL SESSIONS
    //=================================================

    async function deleteCurrentSession() {

        const response =
            await fetch(
                `${API_URL}/sessions`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load sessions."
            );
        }


        const sessions =
            await response.json();


        if (
            !Array.isArray(sessions) ||
            sessions.length === 0
        ) {

            return;
        }


        await Promise.all(

            sessions.map(
                async session => {

                    if (
                        !session ||
                        session.id === undefined ||
                        session.id === null ||
                        session.id === ""
                    ) {

                        return;
                    }


                    const deleteResponse =
                        await fetch(
                            `${API_URL}/sessions/${encodeURIComponent(session.id)}`,
                            {
                                method: "DELETE"
                            }
                        );


                    if (
                        !deleteResponse.ok &&
                        deleteResponse.status !== 404
                    ) {

                        throw new Error(
                            "Unable to remove current session."
                        );
                    }
                }
            )
        );
    }


    //=================================================
    // CREATE SESSION
    //=================================================

    async function createCurrentSession(
        role,
        user
    ) {

        if (
            !user ||
            user.id === undefined ||
            user.id === null ||
            user.id === ""
        ) {

            throw new Error(
                "Invalid user."
            );
        }


        await deleteCurrentSession();


        const sessionData = {

            role,

            userId:
                user.id,

            email:
                user.email || "",

            name:
                role === "admin"
                    ? (
                        user.adminName ||
                        user.name ||
                        ""
                    )
                    : (
                        user.studentName ||
                        user.name ||
                        ""
                    ),

            loginTime:
                new Date().toISOString()
        };


        const response =
            await fetch(
                `${API_URL}/sessions`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            sessionData
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to create login session."
            );
        }


        return await response.json();
    }


    //=================================================
    // CLEAR REACT AUTH STATE
    //=================================================

    function clearAuthState() {

        setLoggedInStudent(
            null
        );


        setLoggedInAdmin(
            null
        );
    }


    //=================================================
    // LOAD CURRENT USER
    //=================================================

    async function loadCurrentUser() {

        try {

            setAuthLoading(
                true
            );


            const session =
                await getCurrentSession();


            //=========================================
            // NO SESSION
            //=========================================

            if (!session) {

                clearAuthState();

                return;
            }


            //=========================================
            // INVALID SESSION
            //=========================================

            if (
                session.userId === undefined ||
                session.userId === null ||
                session.userId === ""
            ) {

                await deleteCurrentSession();

                clearAuthState();

                return;
            }


            //=========================================
            // STUDENT
            //=========================================

            if (
                session.role === "student"
            ) {

                const response =
                    await fetch(
                        `${API_URL}/students/${encodeURIComponent(session.userId)}`
                    );


                if (!response.ok) {

                    await deleteCurrentSession();

                    clearAuthState();

                    return;
                }


                const student =
                    await response.json();


                if (
                    student.active === false
                ) {

                    await deleteCurrentSession();

                    clearAuthState();

                    return;
                }


                setLoggedInStudent(
                    student
                );


                setLoggedInAdmin(
                    null
                );


                return;
            }


            //=========================================
            // ADMIN
            //=========================================

            if (
                session.role === "admin"
            ) {

                const response =
                    await fetch(
                        `${API_URL}/admins/${encodeURIComponent(session.userId)}`
                    );


                if (!response.ok) {

                    await deleteCurrentSession();

                    clearAuthState();

                    return;
                }


                const admin =
                    await response.json();


                if (
                    admin.active === false
                ) {

                    await deleteCurrentSession();

                    clearAuthState();

                    return;
                }


                setLoggedInAdmin(
                    admin
                );


                setLoggedInStudent(
                    null
                );


                return;
            }


            //=========================================
            // INVALID ROLE
            //=========================================

            await deleteCurrentSession();

            clearAuthState();

        }

        catch (error) {

            console.error(
                "Unable to load current user:",
                error
            );


            clearAuthState();

        }

        finally {

            setAuthLoading(
                false
            );
        }
    }


    //=================================================
    // INITIAL LOAD
    //=================================================

    useEffect(
        () => {

            loadCurrentUser();

        },
        []
    );


    //=================================================
    // LOGIN STUDENT
    //=================================================

    async function loginStudent(
        student
    ) {

        try {

            if (
                !student ||
                student.id === undefined ||
                student.id === null ||
                student.id === ""
            ) {

                return false;
            }


            await createCurrentSession(
                "student",
                student
            );


            setLoggedInStudent(
                student
            );


            setLoggedInAdmin(
                null
            );


            return true;

        }

        catch (error) {

            console.error(
                "Student Login Error:",
                error
            );


            return false;
        }
    }


    //=================================================
    // LOGIN ADMIN
    //=================================================

    async function loginAdmin(
        admin
    ) {

        try {

            if (
                !admin ||
                admin.id === undefined ||
                admin.id === null ||
                admin.id === ""
            ) {

                return false;
            }


            await createCurrentSession(
                "admin",
                admin
            );


            setLoggedInAdmin(
                admin
            );


            setLoggedInStudent(
                null
            );


            return true;

        }

        catch (error) {

            console.error(
                "Administrator Login Error:",
                error
            );


            return false;
        }
    }


    //=================================================
    // LOGOUT STUDENT
    //=================================================

    async function logoutStudent() {

        try {

            await deleteCurrentSession();

        }

        catch (error) {

            console.error(
                "Student Logout Error:",
                error
            );
        }


        clearAuthState();
    }


    //=================================================
    // LOGOUT ADMIN
    //=================================================

    async function logoutAdmin() {

        try {

            await deleteCurrentSession();

        }

        catch (error) {

            console.error(
                "Administrator Logout Error:",
                error
            );
        }


        clearAuthState();
    }


    //=================================================
    // GENERAL LOGOUT
    //=================================================

    async function logout(
        role
    ) {

        if (
            role === "admin"
        ) {

            await logoutAdmin();

        } else {

            await logoutStudent();
        }
    }


    //=================================================
    // REFRESH AUTH
    //=================================================

    async function refreshAuth() {

        await loadCurrentUser();
    }


    //=================================================
    // CONTEXT
    //=================================================

    return (

        <AuthContext.Provider
            value={{

                loggedInStudent,

                loggedInAdmin,

                loginStudent,

                loginAdmin,

                logoutStudent,

                logoutAdmin,

                logout,

                authLoading,

                refreshAuth
            }}
        >

            {children}

        </AuthContext.Provider>
    );
}


//=====================================================
// USE AUTH
//=====================================================

export function useAuth() {

    return useContext(
        AuthContext
    );
}