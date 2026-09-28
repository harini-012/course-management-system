//=====================================================
// FORGOT PASSWORD
// JSON SERVER + REACT VERSION
//=====================================================

import {
    queryData,
    patchData
} from "./api.js";


//=====================================================
// INITIALIZE
//=====================================================

function initializeForgotPassword() {

    const form =
        document.getElementById(
            "forgotPasswordForm"
        );


    if (!form) {

        console.error(
            "Forgot Password Form Not Found."
        );

        return;
    }


    if (
        form.dataset.initialized ===
        "true"
    ) {

        return;
    }


    form.dataset.initialized =
        "true";


    form.addEventListener(
        "submit",
        handleForgotPassword
    );
}


//=====================================================
// HANDLE FORGOT PASSWORD
//=====================================================

async function handleForgotPassword(
    event
) {

    event.preventDefault();


    //=================================================
    // EMAIL
    //=================================================

    const emailField =
        document.getElementById(
            "email"
        );


    if (!emailField) {

        console.error(
            "Email field not found."
        );

        return;
    }


    const email =
        String(
            emailField.value || ""
        )
            .trim()
            .toLowerCase();


    //=================================================
    // SELECTED ROLE
    //=================================================

    const roleField =
        document.querySelector(
            'input[name="role"]:checked'
        );


    const role =
        roleField
            ? String(
                roleField.value
            )
                .trim()
                .toLowerCase()
            : null;


    //=================================================
    // EMAIL VALIDATION
    //=================================================

    if (!email) {

        showMessage(
            "Please enter your Email Address.",
            "error"
        );


        emailField.focus();

        return;
    }


    if (
        !validateEmail(
            email
        )
    ) {

        showMessage(
            "Please enter a valid Email Address.",
            "error"
        );


        emailField.focus();

        return;
    }


    //=================================================
    // ROLE VALIDATION
    //=================================================

    if (
        role !== "student" &&
        role !== "admin"
    ) {

        showMessage(
            "Please select Student or Admin.",
            "error"
        );

        return;
    }


    try {

        setButtonLoading(
            true
        );


        //=================================================
        // CHOOSE ONLY SELECTED COLLECTION
        //=================================================

        const resource =
            role === "admin"
                ? "admins"
                : "students";


        //=================================================
        // SEARCH ONLY THAT COLLECTION
        //=================================================

        const users =
            await queryData(
                resource,
                {
                    email:
                        email
                }
            );


        //=================================================
        // NOT FOUND
        //=================================================

        if (
            !Array.isArray(users) ||
            users.length === 0
        ) {

            const roleName =
                role === "admin"
                    ? "Admin"
                    : "Student";


            showMessage(
                `No ${roleName} account found with this Email Address.`,
                "error"
            );


            emailField.focus();

            return;
        }


        //=================================================
        // FOUND
        //=================================================

        await saveResetState(
            email,
            role
        );


        showMessage(
            "Email verified successfully. Redirecting to reset password...",
            "success"
        );


        setTimeout(
            () => {

                window.location.replace(
                    "/reset-password"
                );

            },
            800
        );

    }

    catch (error) {

        console.error(
            "Forgot Password Error:",
            error
        );


        showMessage(
            "Unable to verify your account. Please try again.",
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
// SAVE RESET STATE
//=====================================================

async function saveResetState(
    email,
    role
) {

    await patchData(
        "appState",
        "current",
        {
            resetEmail:
                email,

            resetRole:
                role
        }
    );
}


//=====================================================
// VALIDATE EMAIL
//=====================================================

function validateEmail(
    email
) {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return pattern.test(
        email
    );
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
        document.getElementById(
            "resetBtn"
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
            "Verifying...";

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
// GO TO LOGIN
//=====================================================

function goToLogin() {

    window.location.href =
        "/login";
}


//=====================================================
// REACT SAFE INITIALIZATION
//=====================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeForgotPassword,
        {
            once: true
        }
    );

}

else {

    initializeForgotPassword();
}


//=====================================================
// GLOBAL FUNCTIONS
//=====================================================

window.handleForgotPassword =
    handleForgotPassword;


window.goToLogin =
    goToLogin;