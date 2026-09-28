//=====================================================
// ADMIN REGISTRATION
// MOCK API + REACT VERSION
//=====================================================

import {
    queryData,
    saveData,
    getSession,
    clearSessions
} from "./api.js";


//=====================================================
// REGISTER ADMIN
//=====================================================

async function registerAdmin(event) {

    event.preventDefault();

    const adminNameField =
        document.getElementById("adminName");

    const adminIdField =
        document.getElementById("adminId");

    const adminEmailField =
        document.getElementById("adminEmail");

    const designationField =
        document.getElementById("designation");

    const passwordField =
        document.getElementById("adminPassword");

    const confirmPasswordField =
        document.getElementById(
            "adminConfirmPassword"
        );


    if (
        !adminNameField ||
        !adminIdField ||
        !adminEmailField ||
        !designationField ||
        !passwordField ||
        !confirmPasswordField
    ) {

        console.error(
            "Administrator registration fields not found."
        );

        return;
    }


    const adminName =
        adminNameField.value.trim();

    const adminId =
        adminIdField.value.trim();

    const adminEmail =
        adminEmailField.value
            .trim()
            .toLowerCase();

    const designation =
        designationField.value;

    const password =
        passwordField.value;

    const confirmPassword =
        confirmPasswordField.value;


    //=================================================
    // VALIDATION
    //=================================================

    if (adminName === "") {

        alert(
            "Please enter Administrator Name."
        );

        adminNameField.focus();

        return;
    }


    if (adminName.length < 3) {

        alert(
            "Administrator Name must contain at least 3 characters."
        );

        adminNameField.focus();

        return;
    }


    if (adminId === "") {

        alert(
            "Please enter Administrator ID."
        );

        adminIdField.focus();

        return;
    }


    if (adminId.length < 4) {

        alert(
            "Administrator ID is too short."
        );

        adminIdField.focus();

        return;
    }


    if (adminEmail === "") {

        alert(
            "Please enter Email Address."
        );

        adminEmailField.focus();

        return;
    }


    if (!validateEmail(adminEmail)) {

        alert(
            "Please enter a valid Email Address."
        );

        adminEmailField.focus();

        return;
    }


    if (designation === "") {

        alert(
            "Please select Designation."
        );

        designationField.focus();

        return;
    }


    if (password === "") {

        alert(
            "Please enter Password."
        );

        passwordField.focus();

        return;
    }


    if (password.length < 6) {

        alert(
            "Password must contain at least 6 characters."
        );

        passwordField.focus();

        return;
    }


    if (confirmPassword === "") {

        alert(
            "Please confirm your Password."
        );

        confirmPasswordField.focus();

        return;
    }


    if (
        password !==
        confirmPassword
    ) {

        alert(
            "Passwords do not match."
        );

        confirmPasswordField.focus();

        return;
    }


    try {

        //=================================================
        // DUPLICATE EMAIL
        //=================================================

        const emailAdmins =
            await queryData(
                "admins",
                {
                    email:
                        adminEmail
                }
            );


        if (
            Array.isArray(emailAdmins) &&
            emailAdmins.length > 0
        ) {

            alert(
                "Email already registered."
            );

            adminEmailField.focus();

            return;
        }


        //=================================================
        // DUPLICATE ADMIN ID
        //=================================================

        const idAdmins =
            await queryData(
                "admins",
                {
                    adminId:
                        adminId
                }
            );


        if (
            Array.isArray(idAdmins) &&
            idAdmins.length > 0
        ) {

            alert(
                "Administrator ID already exists."
            );

            adminIdField.focus();

            return;
        }


        //=================================================
        // CREATE ADMIN
        //=================================================

        const newAdmin = {

            adminName:
                adminName,

            adminId:
                adminId,

            email:
                adminEmail,

            designation:
                designation,

            password:
                password,

            role:
                "Administrator",

            createdCourses:
                [],

            managedStudents:
                [],

            managedEnrollments:
                [],

            registrationDate:
                new Date()
                    .toLocaleDateString(),

            lastLogin:
                "",

            active:
                true
        };


        //=================================================
        // SAVE TO MOCK API
        //=================================================

        await saveData(
            "admins",
            newAdmin
        );


        alert(
            "Administrator Registration Successful!"
        );


        const form =
            document.getElementById(
                "adminRegisterForm"
            );


        if (form) {

            form.reset();
        }


        window.location.replace(
            "/login"
        );

    }

    catch (error) {

        console.error(
            "Administrator Registration Error:",
            error
        );


        alert(
            "Unable to register Administrator."
        );
    }
}


//=====================================================
// EMAIL VALIDATION
//=====================================================

function validateEmail(email) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return emailPattern.test(
        email
    );
}


//=====================================================
// INITIALIZE PAGE
//=====================================================

function initializeAdminRegistration() {

    const form =
        document.getElementById(
            "adminRegisterForm"
        );


    if (!form) {

        console.error(
            "Admin Registration Form Not Found."
        );

        return;
    }


    // Prevent duplicate React bindings.

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
        registerAdmin
    );


    //=================================================
    // PASSWORD STRENGTH
    //=================================================

    const passwordField =
        document.getElementById(
            "adminPassword"
        );


    if (passwordField) {

        passwordField.addEventListener(
            "keyup",
            () => {

                const password =
                    passwordField.value;


                if (
                    password.length === 0
                ) {

                    passwordField.style.borderColor =
                        "#ccc";

                }

                else if (
                    password.length < 6
                ) {

                    passwordField.style.borderColor =
                        "red";

                }

                else if (
                    password.length < 8
                ) {

                    passwordField.style.borderColor =
                        "orange";

                }

                else {

                    passwordField.style.borderColor =
                        "green";

                }
            }
        );
    }


    //=================================================
    // CONFIRM PASSWORD
    //=================================================

    const confirmPasswordField =
        document.getElementById(
            "adminConfirmPassword"
        );


    if (confirmPasswordField) {

        confirmPasswordField.addEventListener(
            "keyup",
            () => {

                const password =
                    passwordField
                        ? passwordField.value
                        : "";


                const confirmPassword =
                    confirmPasswordField.value;


                if (
                    confirmPassword.length === 0
                ) {

                    confirmPasswordField
                        .style
                        .borderColor =
                        "#ccc";

                    return;
                }


                confirmPasswordField
                    .style
                    .borderColor =
                    password === confirmPassword
                        ? "green"
                        : "red";
            }
        );
    }


    //=================================================
    // ADMIN NAME
    //=================================================

    const adminNameField =
        document.getElementById(
            "adminName"
        );


    if (adminNameField) {

        adminNameField.addEventListener(
            "input",
            () => {

                adminNameField.value =
                    adminNameField.value.replace(
                        /[^a-zA-Z\s]/g,
                        ""
                    );
            }
        );


        adminNameField.addEventListener(
            "blur",
            () => {

                adminNameField.value =
                    adminNameField.value
                        .toLowerCase()
                        .replace(
                            /\b\w/g,
                            letter =>
                                letter.toUpperCase()
                        );
            }
        );
    }


    //=================================================
    // ADMIN ID
    //=================================================

    const adminIdField =
        document.getElementById(
            "adminId"
        );


    if (adminIdField) {

        adminIdField.addEventListener(
            "input",
            () => {

                adminIdField.value =
                    adminIdField.value.replace(
                        /\s/g,
                        ""
                    );
            }
        );
    }


    //=================================================
    // EMAIL LOWERCASE
    //=================================================

    const emailField =
        document.getElementById(
            "adminEmail"
        );


    if (emailField) {

        emailField.addEventListener(
            "blur",
            () => {

                emailField.value =
                    emailField.value
                        .toLowerCase();
            }
        );
    }


    //=================================================
    // ENTER KEY
    //=================================================

    form.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                event.target.tagName !==
                    "TEXTAREA"
            ) {

                event.preventDefault();

                form.requestSubmit();
            }
        }
    );


    //=================================================
    // INITIAL FOCUS
    //=================================================

    if (adminNameField) {

        adminNameField.focus();
    }
}


//=====================================================
// CLEAR FORM
//=====================================================

function clearAdminForm() {

    const form =
        document.getElementById(
            "adminRegisterForm"
        );


    if (form) {

        form.reset();
    }


    const passwordField =
        document.getElementById(
            "adminPassword"
        );


    const confirmPasswordField =
        document.getElementById(
            "adminConfirmPassword"
        );


    if (passwordField) {

        passwordField.style.borderColor =
            "#ccc";
    }


    if (confirmPasswordField) {

        confirmPasswordField
            .style
            .borderColor =
            "#ccc";
    }
}


//=====================================================
// LOGOUT ADMIN
//=====================================================

async function logoutAdmin() {

    try {

        await clearSessions();

    }

    catch (error) {

        console.error(
            "Logout Error:",
            error
        );
    }


    window.location.replace(
        "/login"
    );
}


//=====================================================
// REACT-COMPATIBLE PAGE INITIALIZATION
//=====================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAdminRegistration,
        {
            once: true
        }
    );

}

else {

    initializeAdminRegistration();
}


//=====================================================
// CHECK EXISTING SESSION
//=====================================================

(async function checkExistingSession() {

    try {

        const session =
            await getSession();


        if (
            session &&
            session.role === "admin"
        ) {

            console.log(
                "Administrator session available."
            );
        }

    }

    catch (error) {

        console.error(
            "Unable to check Administrator session:",
            error
        );
    }
})();


//=====================================================
// GLOBAL FUNCTIONS
//=====================================================

window.clearAdminForm =
    clearAdminForm;

window.logoutAdmin =
    logoutAdmin;