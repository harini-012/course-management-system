//=====================================================
// LOGIN PAGE
// login.js
// MOCK API + REACT VERSION
//=====================================================

import {
    authenticate,
    logoutUser
} from "./auth.js";


import {
    validateEmail,
    validatePassword
} from "./validation.js";


import {
    showMessage
} from "./ui.js";


import {
    getSession
} from "./api.js";


//=====================================================
// DEFAULT ROLE
//=====================================================

let currentRole =
    "student";


//=====================================================
// SHOW STUDENT LOGIN
//=====================================================

function showStudent() {

    currentRole =
        "student";


    //-----------------------------------------
    // LOGIN TITLE
    //-----------------------------------------

    const role =
        document.getElementById(
            "role"
        );


    if (role) {

        role.textContent =
            "Student Login";

    }


    //-----------------------------------------
    // BUTTON ACTIVE STATE
    //-----------------------------------------

    const studentBtn =
        document.getElementById(
            "studentBtn"
        );


    const adminBtn =
        document.getElementById(
            "adminBtn"
        );


    if (studentBtn) {

        studentBtn
            .classList
            .add("active");

    }


    if (adminBtn) {

        adminBtn
            .classList
            .remove("active");

    }


    //-----------------------------------------
    // REGISTER SECTION
    //-----------------------------------------

    const registerTitle =
        document.getElementById(
            "registerTitle"
        );


    if (registerTitle) {

        registerTitle.textContent =
            "New Student?";

    }


    const registerText =
        document.getElementById(
            "registerText"
        );


    if (registerText) {

        registerText.textContent =
            "Don't have a student account?";

    }


    const registerLink =
        document.getElementById(
            "registerLink"
        );


    if (registerLink) {

        registerLink.textContent =
            "Student Register";


        registerLink.href =
            "/register";

    }

}


//=====================================================
// SHOW ADMIN LOGIN
//=====================================================

function showAdmin() {

    currentRole =
        "admin";


    //-----------------------------------------
    // LOGIN TITLE
    //-----------------------------------------

    const role =
        document.getElementById(
            "role"
        );


    if (role) {

        role.textContent =
            "Administrator Login";

    }


    //-----------------------------------------
    // BUTTON ACTIVE STATE
    //-----------------------------------------

    const adminBtn =
        document.getElementById(
            "adminBtn"
        );


    const studentBtn =
        document.getElementById(
            "studentBtn"
        );


    if (adminBtn) {

        adminBtn
            .classList
            .add("active");

    }


    if (studentBtn) {

        studentBtn
            .classList
            .remove("active");

    }


    //-----------------------------------------
    // REGISTER SECTION
    //-----------------------------------------

    const registerTitle =
        document.getElementById(
            "registerTitle"
        );


    if (registerTitle) {

        registerTitle.textContent =
            "New Administrator?";

    }


    const registerText =
        document.getElementById(
            "registerText"
        );


    if (registerText) {

        registerText.textContent =
            "Don't have an administrator account?";

    }


    const registerLink =
        document.getElementById(
            "registerLink"
        );


    if (registerLink) {

        registerLink.textContent =
            "Administrator Register";


        registerLink.href =
            "/admin-register";

    }

}


//=====================================================
// LOGIN
//=====================================================

async function loginUser(event) {

    if (event) {

        event.preventDefault();

    }


    //-----------------------------------------
    // GET EMAIL
    //-----------------------------------------

    const emailInput =
        document.getElementById(
            "email"
        );


    //-----------------------------------------
    // GET PASSWORD
    //-----------------------------------------

    const passwordInput =
        document.getElementById(
            "password"
        );


    //-----------------------------------------
    // CHECK FIELDS EXIST
    //-----------------------------------------

    if (
        !emailInput ||
        !passwordInput
    ) {

        showMessage(
            "Login fields not found."
        );


        return;

    }


    //-----------------------------------------
    // GET VALUES
    //-----------------------------------------

    const email =
        emailInput
            .value
            .trim()
            .toLowerCase();


    const password =
        passwordInput
            .value;


    //-----------------------------------------
    // EMAIL EMPTY
    //-----------------------------------------

    if (email === "") {

        showMessage(
            "Please enter Email."
        );


        emailInput.focus();


        return;

    }


    //-----------------------------------------
    // EMAIL VALIDATION
    //-----------------------------------------

    if (
        !validateEmail(
            email
        )
    ) {

        showMessage(
            "Enter a valid Email Address."
        );


        emailInput.focus();


        return;

    }


    //-----------------------------------------
    // PASSWORD EMPTY
    //-----------------------------------------

    if (password === "") {

        showMessage(
            "Please enter Password."
        );


        passwordInput.focus();


        return;

    }


    //-----------------------------------------
    // PASSWORD VALIDATION
    //-----------------------------------------

    if (
        !validatePassword(
            password
        )
    ) {

        showMessage(
            "Password must contain at least 6 characters."
        );


        passwordInput.focus();


        return;

    }


    try {

        //-----------------------------------------
        // AUTHENTICATE USING MOCK API
        //-----------------------------------------

        const result =
            await authenticate(
                currentRole,
                email,
                password
            );


        //-----------------------------------------
        // LOGIN FAILED
        //-----------------------------------------

        if (
            !result ||
            !result.success
        ) {

            showMessage(
                result?.message ||
                "Invalid Email or Password."
            );


            return;

        }


        //-----------------------------------------
        // LOGIN SUCCESS
        //-----------------------------------------

        showMessage(
            result.message ||
            "Login Successful!"
        );


        //-----------------------------------------
        // STUDENT REDIRECT
        //-----------------------------------------

        if (
            currentRole ===
            "student"
        ) {

            window.location.replace(
                "/student-dashboard"
            );


            return;

        }


        //-----------------------------------------
        // ADMIN REDIRECT
        //-----------------------------------------

        window.location.replace(
            "/admin-dashboard"
        );


        return;

    }

    catch (error) {

        console.error(
            "Login Error:",
            error
        );


        showMessage(
            "Unable to login."
        );

    }

}


//=====================================================
// LOGOUT
//=====================================================

async function logout() {

    try {

        const result =
            await logoutUser();


        if (
            result &&
            result.message
        ) {

            showMessage(
                result.message
            );

        }


        window.location.replace(
            "/login"
        );

    }

    catch (error) {

        console.error(
            "Logout Error:",
            error
        );


        window.location.replace(
            "/login"
        );

    }

}


//=====================================================
// INITIALIZE LOGIN PAGE
//=====================================================

function initializeLoginPage() {

    //-----------------------------------------
    // DEFAULT STUDENT LOGIN
    //-----------------------------------------

    showStudent();


    //-----------------------------------------
    // STUDENT BUTTON
    //-----------------------------------------

    const studentBtn =
        document.getElementById(
            "studentBtn"
        );


    if (
        studentBtn &&
        studentBtn.dataset.loginInitialized !==
        "true"
    ) {

        studentBtn.dataset.loginInitialized =
            "true";


        studentBtn.addEventListener(
            "click",
            showStudent
        );

    }


    //-----------------------------------------
    // ADMIN BUTTON
    //-----------------------------------------

    const adminBtn =
        document.getElementById(
            "adminBtn"
        );


    if (
        adminBtn &&
        adminBtn.dataset.loginInitialized !==
        "true"
    ) {

        adminBtn.dataset.loginInitialized =
            "true";


        adminBtn.addEventListener(
            "click",
            showAdmin
        );

    }


    //-----------------------------------------
    // LOGIN BUTTON
    //-----------------------------------------

    const loginBtn =
        document.querySelector(
            ".login-btn"
        );


    if (
        loginBtn &&
        loginBtn.dataset.loginInitialized !==
        "true"
    ) {

        loginBtn.dataset.loginInitialized =
            "true";


        loginBtn.addEventListener(
            "click",
            loginUser
        );

    }


    //-----------------------------------------
    // FORM SUBMIT
    //-----------------------------------------

    const form =
        document.querySelector(
            ".container form"
        );


    if (
        form &&
        form.dataset.loginFormInitialized !==
        "true"
    ) {

        form.dataset.loginFormInitialized =
            "true";


        form.addEventListener(
            "submit",
            loginUser
        );

    }


    //-----------------------------------------
    // EMAIL ENTER KEY
    //-----------------------------------------

    const emailInput =
        document.getElementById(
            "email"
        );


    if (
        emailInput &&
        emailInput.dataset.enterInitialized !==
        "true"
    ) {

        emailInput.dataset.enterInitialized =
            "true";


        emailInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    loginUser(
                        event
                    );

                }

            }
        );

    }


    //-----------------------------------------
    // PASSWORD ENTER KEY
    //-----------------------------------------

    const passwordInput =
        document.getElementById(
            "password"
        );


    if (
        passwordInput &&
        passwordInput.dataset.enterInitialized !==
        "true"
    ) {

        passwordInput.dataset.enterInitialized =
            "true";


        passwordInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    loginUser(
                        event
                    );

                }

            }
        );

    }


    //-----------------------------------------
    // INITIAL FOCUS
    //-----------------------------------------

    if (emailInput) {

        emailInput.focus();

    }

}


//=====================================================
// REACT + NORMAL HTML COMPATIBLE INITIALIZATION
//=====================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeLoginPage,
        {
            once: true
        }
    );

}

else {

    initializeLoginPage();

}


//=====================================================
// MAKE FUNCTIONS AVAILABLE
//=====================================================

window.showStudent =
    showStudent;


window.showAdmin =
    showAdmin;


window.loginUser =
    loginUser;


window.logout =
    logout;


//=====================================================
// CHECK EXISTING SESSION
//=====================================================

(async function checkExistingSession() {

    try {

        const session =
            await getSession();


        if (!session) {

            return;

        }


        console.log(
            `${session.role} session available.`
        );

    }

    catch (error) {

        console.error(
            "Unable to check session:",
            error
        );

    }

})();