//=====================================================
// API
// api.js
// JSON SERVER API HELPERS
//=====================================================

const API_URL =
    "http://localhost:5000";


//=====================================================
// GET ALL DATA
//=====================================================

export async function getData(
    resource
) {

    const response =
        await fetch(
            `${API_URL}/${resource}`
        );


    if (!response.ok) {

        throw new Error(
            `Unable to load ${resource}`
        );

    }


    return await response.json();
}


//=====================================================
// GET BY ID
//=====================================================

export async function getById(
    resource,
    id
) {

    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        return null;
    }


    const response =
        await fetch(
            `${API_URL}/${resource}/${encodeURIComponent(id)}`
        );


    if (
        response.status === 404
    ) {

        return null;
    }


    if (!response.ok) {

        throw new Error(
            `Unable to load ${resource}/${id}`
        );

    }


    return await response.json();
}


//=====================================================
// QUERY DATA
//=====================================================

export async function queryData(
    resource,
    params = {}
) {

    const query =
        new URLSearchParams();


    Object.entries(params)
        .forEach(
            ([key, value]) => {

                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {

                    query.append(
                        key,
                        value
                    );

                }

            }
        );


    const queryString =
        query.toString();


    const url =
        queryString
            ? `${API_URL}/${resource}?${queryString}`
            : `${API_URL}/${resource}`;


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            `Unable to query ${resource}`
        );

    }


    return await response.json();
}


//=====================================================
// POST DATA
//=====================================================

export async function saveData(
    resource,
    data
) {

    const response =
        await fetch(
            `${API_URL}/${resource}`,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(data)
            }
        );


    if (!response.ok) {

        throw new Error(
            `Unable to save ${resource}`
        );

    }


    return await response.json();
}


//=====================================================
// PUT DATA
//=====================================================

export async function updateData(
    resource,
    id,
    data
) {

    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        throw new Error(
            `Invalid ${resource} id`
        );

    }


    const response =
        await fetch(
            `${API_URL}/${resource}/${encodeURIComponent(id)}`,
            {
                method:
                    "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(data)
            }
        );


    if (!response.ok) {

        throw new Error(
            `Unable to update ${resource}`
        );

    }


    return await response.json();
}


//=====================================================
// PATCH DATA
//=====================================================

export async function patchData(
    resource,
    id,
    data
) {

    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        throw new Error(
            `Invalid ${resource} id`
        );

    }


    const response =
        await fetch(
            `${API_URL}/${resource}/${encodeURIComponent(id)}`,
            {
                method:
                    "PATCH",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(data)
            }
        );


    if (!response.ok) {

        throw new Error(
            `Unable to patch ${resource}`
        );

    }


    return await response.json();
}


//=====================================================
// DELETE DATA
//=====================================================

export async function removeData(
    resource,
    id
) {

    if (
        id === undefined ||
        id === null ||
        id === ""
    ) {

        return false;
    }


    const response =
        await fetch(
            `${API_URL}/${resource}/${encodeURIComponent(id)}`,
            {
                method:
                    "DELETE"
            }
        );


    if (
        !response.ok &&
        response.status !== 404
    ) {

        throw new Error(
            `Unable to delete ${resource}`
        );

    }


    return true;
}


//=====================================================
// GET CURRENT SESSION
//=====================================================

export async function getSession() {

    try {

        /*
         * IMPORTANT:
         *
         * Do NOT search using:
         *
         * /sessions?id=current
         *
         * JSON Server can generate its own ID.
         *
         * Our application keeps only one active
         * session, so read the sessions collection
         * and return the newest/last session.
         */

        const sessions =
            await getData(
                "sessions"
            );


        if (
            !Array.isArray(sessions) ||
            sessions.length === 0
        ) {

            return null;
        }


        return sessions[
            sessions.length - 1
        ];

    }

    catch (error) {

        console.error(
            "Unable to get current session:",
            error
        );


        return null;
    }
}


//=====================================================
// CLEAR ALL SESSIONS
//=====================================================

export async function clearSessions() {

    try {

        const sessions =
            await getData(
                "sessions"
            );


        if (
            !Array.isArray(sessions) ||
            sessions.length === 0
        ) {

            return true;
        }


        for (
            const session of sessions
        ) {

            if (
                !session ||
                session.id === undefined ||
                session.id === null ||
                session.id === ""
            ) {

                continue;
            }


            await removeData(
                "sessions",
                session.id
            );

        }


        return true;

    }

    catch (error) {

        console.error(
            "Unable to clear sessions:",
            error
        );


        return false;
    }
}


//=====================================================
// CREATE CURRENT SESSION
//=====================================================

export async function createSession(
    sessionData
) {

    /*
     * Only one user should be logged in.
     */

    await clearSessions();


    /*
     * Do NOT manually send id:"current".
     * Allow JSON Server to create the ID.
     */

    const session = {

        role:
            sessionData.role,

        userId:
            sessionData.userId,

        email:
            sessionData.email,

        name:
            sessionData.name || "",

        loginTime:
            new Date().toISOString()

    };


    return await saveData(
        "sessions",
        session
    );
}


//=====================================================
// GET CURRENT STUDENT
//=====================================================

export async function getCurrentStudent() {

    try {

        const session =
            await getSession();


        if (
            !session ||
            session.role !== "student"
        ) {

            return null;
        }


        if (
            session.userId === undefined ||
            session.userId === null
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
            "Unable to get current student:",
            error
        );


        return null;
    }
}


//=====================================================
// GET CURRENT ADMIN
//=====================================================

export async function getCurrentAdmin() {

    try {

        const session =
            await getSession();


        if (
            !session ||
            session.role !== "admin"
        ) {

            return null;
        }


        if (
            session.userId === undefined ||
            session.userId === null
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
            "Unable to get current administrator:",
            error
        );


        return null;
    }
}


//=====================================================
// GET SELECTED COURSE KEY
//=====================================================

export async function getSelectedCourseKey() {

    try {

        const state =
            await getById(
                "appState",
                "current"
            );


        return state
            ? state.selectedCourseKey
            : null;

    }

    catch (error) {

        console.error(
            "Unable to get selected course:",
            error
        );


        return null;
    }
}


//=====================================================
// SET SELECTED COURSE KEY
//=====================================================

export async function setSelectedCourseKey(
    courseKey
) {

    return await patchData(
        "appState",
        "current",
        {
            selectedCourseKey:
                courseKey
        }
    );
}


//=====================================================
// GET APPLICATION STATE
//=====================================================

export async function getAppState() {

    return await getById(
        "appState",
        "current"
    );
}


//=====================================================
// UPDATE APPLICATION STATE
//=====================================================

export async function updateAppState(
    data
) {

    return await patchData(
        "appState",
        "current",
        data
    );
}


//=====================================================
// EXPORT API URL
//=====================================================

export {
    API_URL
};