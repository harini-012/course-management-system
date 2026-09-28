//=====================================================
// RESET PASSWORD
// JSON SERVER + REACT VERSION
//=====================================================

import {
    getById,
    queryData,
    patchData
} from "./api.js";


let resetEmail = null;

let resetRole = null;

let resetUser = null;


//=====================================================
// INITIALIZE RESET PASSWORD
//=====================================================

async function initializeResetPassword() {

    try {

        //=================================================
        // GET RESET STATE FROM JSON SERVER
        //=================================================

        const appState =
            await getById(
                "appState",
                "current"
            );


        resetEmail =
            appState
                ?.resetEmail ||
            null;


        resetRole =
            appState
                ?.resetRole ||
            null;


        //=================================================
        // INVALID RESET REQUEST
        //=================================================

        if (
            !resetEmail ||
            !resetRole
        ) {

            showMessage(
                "Password reset session is invalid. Please request a new password reset.",
                "error"
            );


            setTimeout(
                () => {

                    window.location.replace(
                        "/forgot-password"
                    );

                },
                1200
            );


            return;
        }


        //=================================================
        // VERIFY USER STILL EXISTS
        //=================================================

        const resource =
            resetRole === "admin"
                ? "admins"
                : "students";


        const users =
            await queryData(
                resource,
                {
                    email:
                        resetEmail
                }
            );


        if (
            !Array.isArray(users) ||
            users.length === 0
        ) {

            await clearResetState();


            showMessage(
                "Account not found. Please request a new password reset.",
                "error"
            );


            setTimeout(
                () => {

                    window.location.replace(
                        "/forgot-password"
                    );

                },
                1200
            );


            return;
        }


        resetUser =
            users[0];


        //=================================================
        // DISPLAY EMAIL
        //=================================================

        setText(
            "resetEmailDisplay",
            resetEmail
        );


        setText(
            "emailDisplay",
            resetEmail
        );


        setText(
            "userEmail",
            resetEmail
        );


        //=================================================
        // BIND FORM
        //=================================================

        const form =
            document.getElementById(
                "resetPasswordForm"
            );


        if (!form) {

            console.error(
                "Reset Password Form Not Found."
            );

            return;
        }


        if (
            form.dataset.initialized !==
            "true"
        ) {

            form.dataset.initialized =
                "true";


            form.addEventListener(
                "submit",
                handleResetPassword
            );
        }


        //=================================================
        // PASSWORD VALIDATION
        //=================================================

        initializePasswordFields();

    }

    catch (error) {

        console.error(
            "Reset Password Initialization Error:",
            error
        );


        showMessage(
            "Unable to load password reset page.",
            "error"
        );
    }
}


//=====================================================
// HANDLE RESET PASSWORD
//=====================================================

async function handleResetPassword(
    event
) {

    event.preventDefault();


    //=================================================
    // GET FIELDS
    //=================================================

    const passwordField =
        document.getElementById(
            "newPassword"
        )
        ||
        document.getElementById(
            "password"
        );


    const confirmPasswordField =
        document.getElementById(
            "confirmPassword"
        )
        ||
        document.getElementById(
            "confirmNewPassword"
        );


    if (
        !passwordField ||
        !confirmPasswordField
    ) {

        console.error(
            "Password fields not found."
        );

        return;
    }


    const password =
        String(
            passwordField.value ||
            ""
        );


    const confirmPassword =
        String(
            confirmPasswordField.value ||
            ""
        );


    //=================================================
    // VALIDATION
    //=================================================

    if (!password) {

        showMessage(
            "Please enter a New Password.",
            "error"
        );


        passwordField.focus();

        return;
    }


    if (
        password.length < 6
    ) {

        showMessage(
            "Password must contain at least 6 characters.",
            "error"
        );


        passwordField.focus();

        return;
    }


    if (!confirmPassword) {

        showMessage(
            "Please confirm your New Password.",
            "error"
        );


        confirmPasswordField.focus();

        return;
    }


    if (
        password !==
        confirmPassword
    ) {

        showMessage(
            "Passwords do not match.",
            "error"
        );


        confirmPasswordField.focus();

        return;
    }


    //=================================================
    // VERIFY RESET STATE
    //=================================================

    if (
        !resetEmail ||
        !resetRole ||
        !resetUser
    ) {

        showMessage(
            "Password reset session has expired. Please try again.",
            "error"
        );


        setTimeout(
            () => {

                window.location.replace(
                    "/forgot-password"
                );

            },
            1200
        );


        return;
    }


    try {

        setButtonLoading(
            true
        );


        //=================================================
        // COLLECTION
        //=================================================

        const resource =
            resetRole === "admin"
                ? "admins"
                : "students";


        //=================================================
        // UPDATE PASSWORD
        //=================================================

        await patchData(
            resource,
            resetUser.id,
            {
                password:
                    password,

                passwordUpdatedAt:
                    new Date()
                        .toISOString()
            }
        );


        //=================================================
        // CLEAR RESET STATE
        //=================================================

        await clearResetState();


        resetEmail =
            null;


        resetRole =
            null;


        resetUser =
            null;


        //=================================================
        // SUCCESS
        //=================================================

        showMessage(
            "Password Reset Successful! Redirecting to Login...",
            "success"
        );


        const form =
            document.getElementById(
                "resetPasswordForm"
            );


        if (form) {

            form.reset();
        }


        setTimeout(
            () => {

                window.location.replace(
                    "/login"
                );

            },
            1000
        );

    }

    catch (error) {

        console.error(
            "Reset Password Error:",
            error
        );


        showMessage(
            "Unable to reset password. Please try again.",
            "error"
        );

    }

    finally {

        setButtonLoading(
            false
        );
    }
}


//=====================================================
// CLEAR RESET STATE
//=====================================================

async function clearResetState() {

    try {

        await patchData(
            "appState",
            "current",
            {
                resetEmail:
                    null,

                resetRole:
                    null
            }
        );

    }

    catch (error) {

        console.error(
            "Unable to clear reset state:",
            error
        );
    }
}


//=====================================================
// PASSWORD FIELD EVENTS
//=====================================================

function initializePasswordFields() {

    const passwordField =
        document.getElementById(
            "newPassword"
        )
        ||
        document.getElementById(
            "password"
        );


    const confirmPasswordField =
        document.getElementById(
            "confirmPassword"
        )
        ||
        document.getElementById(
            "confirmNewPassword"
        );


    //=================================================
    // PASSWORD STRENGTH
    //=================================================

    if (
        passwordField &&
        passwordField.dataset.initialized !==
            "true"
    ) {

        passwordField.dataset.initialized =
            "true";


        passwordField.addEventListener(
            "input",
            () => {

                const password =
                    passwordField.value;


                if (
                    password.length === 0
                ) {

                    passwordField
                        .style
                        .borderColor =
                        "";

                }

                else if (
                    password.length < 6
                ) {

                    passwordField
                        .style
                        .borderColor =
                        "#dc2626";

                }

                else if (
                    password.length < 8
                ) {

                    passwordField
                        .style
                        .borderColor =
                        "#f59e0b";

                }

                else {

                    passwordField
                        .style
                        .borderColor =
                        "#16a34a";
                }


                updatePasswordStrength(
                    password
                );
            }
        );
    }


    //=================================================
    // CONFIRM PASSWORD
    //=================================================

    if (
        confirmPasswordField &&
        confirmPasswordField
            .dataset
            .initialized !==
            "true"
    ) {

        confirmPasswordField
            .dataset
            .initialized =
            "true";


        confirmPasswordField
            .addEventListener(
                "input",
                () => {

                    if (
                        confirmPasswordField
                            .value
                            .length === 0
                    ) {

                        confirmPasswordField
                            .style
                            .borderColor =
                            "";

                        return;
                    }


                    confirmPasswordField
                        .style
                        .borderColor =
                        passwordField &&
                        passwordField.value ===
                            confirmPasswordField.value
                            ? "#16a34a"
                            : "#dc2626";
                }
            );
    }
}


//=====================================================
// PASSWORD STRENGTH DISPLAY
//=====================================================

function updatePasswordStrength(
    password
) {

    const strengthElement =
        document.getElementById(
            "passwordStrength"
        );


    if (!strengthElement) {

        return;
    }


    if (!password) {

        strengthElement.textContent =
            "";

        return;
    }


    let score =
        0;


    if (
        password.length >= 6
    ) {

        score++;
    }


    if (
        password.length >= 8
    ) {

        score++;
    }


    if (
        /[A-Z]/.test(
            password
        )
    ) {

        score++;
    }


    if (
        /[0-9]/.test(
            password
        )
    ) {

        score++;
    }


    if (
        /[^A-Za-z0-9]/.test(
            password
        )
    ) {

        score++;
    }


    if (
        score <= 1
    ) {

        strengthElement.textContent =
            "Weak Password";


        strengthElement.style.color =
            "#dc2626";

    }

    else if (
        score <= 3
    ) {

        strengthElement.textContent =
            "Medium Password";


        strengthElement.style.color =
            "#f59e0b";

    }

    else {

        strengthElement.textContent =
            "Strong Password";


        strengthElement.style.color =
            "#16a34a";
    }
}


//=====================================================
// SHOW / HIDE PASSWORD
//=====================================================

function togglePassword(
    fieldId
) {

    const field =
        document.getElementById(
            fieldId
        );


    if (!field) {

        return;
    }


    field.type =
        field.type === "password"
            ? "text"
            : "password";
}


//=====================================================
// SHOW MESSAGE
//=====================================================

function showMessage(
    message,
    type = "error"
) {

    const messageBox =
        document.getElementById(
            "message"
        )
        ||
        document.getElementById(
            "messageBox"
        )
        ||
        document.getElementById(
            "resetMessage"
        );


    if (messageBox) {

        messageBox.textContent =
            message;


        messageBox.style.display =
            "block";


        messageBox.classList.remove(
            "success",
            "error"
        );


        messageBox.classList.add(
            type
        );


        messageBox.style.color =
            type === "success"
                ? "#15803d"
                : "#dc2626";


        return;
    }


    alert(
        message
    );
}


//=====================================================
// BUTTON LOADING
//=====================================================

function setButtonLoading(
    loading
) {

    const button =
        document.querySelector(
            "#resetPasswordForm button[type='submit']"
        );


    if (!button) {

        return;
    }


    if (loading) {

        if (
            !button.dataset.originalText
        ) {

            button.dataset.originalText =
                button.textContent;
        }


        button.disabled =
            true;


        button.textContent =
            "Resetting...";

    }

    else {

        button.disabled =
            false;


        button.textContent =
            button.dataset.originalText ||
            "Reset Password";
    }
}


//=====================================================
// SET TEXT
//=====================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;
    }
}


//=====================================================
// GO TO LOGIN
//=====================================================

async function goToLogin() {

    await clearResetState();


    window.location.href =
        "/login";
}


//=====================================================
// BACK TO FORGOT PASSWORD
//=====================================================

async function backToForgotPassword() {

    await clearResetState();


    window.location.href =
        "/forgot-password";
}


//=====================================================
// REACT-SAFE INITIALIZATION
//=====================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeResetPassword,
        {
            once: true
        }
    );

}

else {

    initializeResetPassword();
}


//=====================================================
// GLOBAL FUNCTIONS
//=====================================================

window.handleResetPassword =
    handleResetPassword;

window.togglePassword =
    togglePassword;

window.goToLogin =
    goToLogin;

window.backToForgotPassword =
    backToForgotPassword;