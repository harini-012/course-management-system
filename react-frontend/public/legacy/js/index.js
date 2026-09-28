//=====================================================
// HOME PAGE
// index.js
// MOCK API VERSION
//=====================================================

import {
    getSession,
    removeData
} from "./api.js";


//=====================================================
// DOM ELEMENTS
//=====================================================

const loginLink =
    document.getElementById(
        "loginLink"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


//=====================================================
// INITIALIZE HOME PAGE
//=====================================================

async function initializeHomePage() {

    try {

        //=================================================
        // GET CURRENT SESSION FROM MOCK API
        //=================================================

        const session =
            await getSession();


        //=================================================
        // USER LOGGED IN
        //=================================================

        if (session) {

            if (loginLink) {

                loginLink.style.display =
                    "none";

            }


            if (logoutBtn) {

                logoutBtn.style.display =
                    "inline-block";

            }

        }

        //=================================================
        // USER NOT LOGGED IN
        //=================================================

        else {

            if (loginLink) {

                loginLink.style.display =
                    "inline-block";

            }


            if (logoutBtn) {

                logoutBtn.style.display =
                    "none";

            }

        }

    }

    catch (error) {

        console.error(
            "Home Page Session Error:",
            error
        );


        //=================================================
        // IF API SESSION CANNOT BE FOUND
        // SHOW LOGIN
        //=================================================

        if (loginLink) {

            loginLink.style.display =
                "inline-block";

        }


        if (logoutBtn) {

            logoutBtn.style.display =
                "none";

        }

    }

}


//=====================================================
// LOGOUT
//=====================================================

async function logout() {

    try {

        //=================================================
        // DELETE CURRENT SESSION
        //=================================================

        await removeData(
            "sessions",
            "current"
        );

    }

    catch (error) {

        // Session may already be absent.

    }


    //=================================================
    // PRESERVE CURRENT HOME PAGE BEHAVIOR
    //=================================================

    window.location.reload();

}


//=====================================================
// LOGOUT BUTTON
//=====================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logout
    );

}


//=====================================================
// PAGE LOAD
//=====================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeHomePage
    );

}

else {

    initializeHomePage();

}


//=====================================================
// GLOBAL FUNCTION
//=====================================================

window.logout =
    logout;