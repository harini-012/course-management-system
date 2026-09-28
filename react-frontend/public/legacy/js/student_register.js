import {
    queryData,
    saveData
} from "./api.js";


//=====================================================
// STUDENT REGISTRATION
//=====================================================


//=====================================================
// INITIALIZE PAGE
//=====================================================

function initializeRegistration() {

    const form =
        document.getElementById(
            "registerForm"
        );


    if (!form) {

        console.error(
            "Registration form not found."
        );

        return;

    }


    /*
     * Prevent duplicate event binding if React
     * loads the script again.
     */

    if (
        form.dataset.registrationInitialized ===
        "true"
    ) {

        return;

    }


    form.dataset.registrationInitialized =
        "true";


    form.addEventListener(
        "submit",
        registerStudent
    );

}


//=====================================================
// REGISTER STUDENT
//=====================================================

async function registerStudent(
    event
) {

    event.preventDefault();


    const studentName =
        document
            .getElementById(
                "studentName"
            )
            .value
            .trim();


    const studentId =
        document
            .getElementById(
                "studentId"
            )
            .value
            .trim();


    const studentEmail =
        document
            .getElementById(
                "studentEmail"
            )
            .value
            .trim()
            .toLowerCase();


    const department =
        document
            .getElementById(
                "department"
            )
            .value;


    const password =
        document
            .getElementById(
                "password"
            )
            .value;


    const confirmPassword =
        document
            .getElementById(
                "confirmPassword"
            )
            .value;


    //=================================================
    // STUDENT NAME
    //=================================================

    if (studentName === "") {

        alert(
            "Please enter Student Name."
        );


        document
            .getElementById(
                "studentName"
            )
            .focus();


        return;

    }


    if (studentName.length < 3) {

        alert(
            "Student Name should contain at least 3 characters."
        );


        document
            .getElementById(
                "studentName"
            )
            .focus();


        return;

    }


    //=================================================
    // STUDENT ID
    //=================================================

    if (studentId === "") {

        alert(
            "Please enter Student ID."
        );


        document
            .getElementById(
                "studentId"
            )
            .focus();


        return;

    }


    if (studentId.length < 4) {

        alert(
            "Student ID is too short."
        );


        document
            .getElementById(
                "studentId"
            )
            .focus();


        return;

    }


    //=================================================
    // EMAIL
    //=================================================

    if (studentEmail === "") {

        alert(
            "Please enter Email Address."
        );


        document
            .getElementById(
                "studentEmail"
            )
            .focus();


        return;

    }


    if (
        !validateEmail(
            studentEmail
        )
    ) {

        alert(
            "Please enter a valid Email Address."
        );


        document
            .getElementById(
                "studentEmail"
            )
            .focus();


        return;

    }


    //=================================================
    // DEPARTMENT
    //=================================================

    if (department === "") {

        alert(
            "Please select Department."
        );


        document
            .getElementById(
                "department"
            )
            .focus();


        return;

    }


    //=================================================
    // PASSWORD
    //=================================================

    if (password === "") {

        alert(
            "Please enter Password."
        );


        document
            .getElementById(
                "password"
            )
            .focus();


        return;

    }


    if (password.length < 6) {

        alert(
            "Password must contain at least 6 characters."
        );


        document
            .getElementById(
                "password"
            )
            .focus();


        return;

    }


    //=================================================
    // CONFIRM PASSWORD
    //=================================================

    if (confirmPassword === "") {

        alert(
            "Please confirm your Password."
        );


        document
            .getElementById(
                "confirmPassword"
            )
            .focus();


        return;

    }


    if (
        password !==
        confirmPassword
    ) {

        alert(
            "Passwords do not match."
        );


        document
            .getElementById(
                "confirmPassword"
            )
            .focus();


        return;

    }


    try {

        //=============================================
        // CHECK EMAIL THROUGH MOCK API
        //=============================================

        const emailStudents =
            await queryData(
                "students",
                {
                    email:
                        studentEmail
                }
            );


        if (
            emailStudents.length > 0
        ) {

            alert(
                "Email already registered."
            );


            document
                .getElementById(
                    "studentEmail"
                )
                .focus();


            return;

        }


        //=============================================
        // CHECK STUDENT ID THROUGH MOCK API
        //=============================================

        const idStudents =
            await queryData(
                "students",
                {
                    studentId:
                        studentId
                }
            );


        if (
            idStudents.length > 0
        ) {

            alert(
                "Student ID already exists."
            );


            document
                .getElementById(
                    "studentId"
                )
                .focus();


            return;

        }


        //=============================================
        // CREATE STUDENT
        //=============================================

        const newStudent = {

            studentName:
                studentName,

            studentId:
                studentId,

            email:
                studentEmail,

            department:
                department,

            password:
                password,

            role:
                "Student",

            enrolledCourses:
                [],

            completedCourses:
                [],

            certificates:
                [],

            progress:
                {},

            registrationDate:
                new Date()
                    .toLocaleDateString(),

            lastLogin:
                "",

            active:
                true

        };


        //=============================================
        // SAVE TO MOCK API
        //=============================================

        await saveData(
            "students",
            newStudent
        );


        //=============================================
        // EXISTING SUCCESS FLOW
        //=============================================

        alert(
            "Student Registration Successful!"
        );


        document
            .getElementById(
                "registerForm"
            )
            .reset();


        window.location.href =
            "/login";

    }

    catch (error) {

        console.error(
            "Student registration error:",
            error
        );


        alert(
            "Unable to register student."
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
// PASSWORD STRENGTH
//=====================================================

function initializePasswordValidation() {

    const passwordField =
        document.getElementById(
            "password"
        );


    if (
        passwordField &&
        passwordField.dataset.passwordInitialized !==
        "true"
    ) {

        passwordField.dataset.passwordInitialized =
            "true";


        passwordField.addEventListener(
            "keyup",
            () => {

                const password =
                    passwordField.value;


                if (
                    password.length === 0
                ) {

                    passwordField
                        .style
                        .borderColor =
                        "#ccc";

                }

                else if (
                    password.length < 6
                ) {

                    passwordField
                        .style
                        .borderColor =
                        "red";

                }

                else if (
                    password.length < 8
                ) {

                    passwordField
                        .style
                        .borderColor =
                        "orange";

                }

                else {

                    passwordField
                        .style
                        .borderColor =
                        "green";

                }

            }
        );

    }

}


//=====================================================
// CONFIRM PASSWORD
//=====================================================

function initializeConfirmPassword() {

    const confirmPasswordField =
        document.getElementById(
            "confirmPassword"
        );


    if (
        !confirmPasswordField ||
        confirmPasswordField.dataset.confirmInitialized ===
        "true"
    ) {

        return;

    }


    confirmPasswordField.dataset.confirmInitialized =
        "true";


    confirmPasswordField.addEventListener(
        "keyup",
        () => {

            const passwordField =
                document.getElementById(
                    "password"
                );


            if (!passwordField) {

                return;

            }


            const password =
                passwordField.value;


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


            if (
                password ===
                confirmPassword
            ) {

                confirmPasswordField
                    .style
                    .borderColor =
                    "green";

            }

            else {

                confirmPasswordField
                    .style
                    .borderColor =
                    "red";

            }

        }
    );

}


//=====================================================
// STUDENT NAME
//=====================================================

function initializeStudentName() {

    const studentNameField =
        document.getElementById(
            "studentName"
        );


    if (
        !studentNameField ||
        studentNameField.dataset.nameInitialized ===
        "true"
    ) {

        return;

    }


    studentNameField.dataset.nameInitialized =
        "true";


    studentNameField.addEventListener(
        "input",
        () => {

            studentNameField.value =
                studentNameField
                    .value
                    .replace(
                        /[^a-zA-Z\s]/g,
                        ""
                    );

        }
    );


    studentNameField.addEventListener(
        "blur",
        () => {

            studentNameField.value =
                studentNameField
                    .value
                    .toLowerCase()
                    .replace(
                        /\b\w/g,
                        letter =>
                            letter.toUpperCase()
                    );

        }
    );

}


//=====================================================
// STUDENT ID
//=====================================================

function initializeStudentId() {

    const studentIdField =
        document.getElementById(
            "studentId"
        );


    if (
        !studentIdField ||
        studentIdField.dataset.idInitialized ===
        "true"
    ) {

        return;

    }


    studentIdField.dataset.idInitialized =
        "true";


    studentIdField.addEventListener(
        "input",
        () => {

            studentIdField.value =
                studentIdField
                    .value
                    .replace(
                        /\s/g,
                        ""
                    );

        }
    );

}


//=====================================================
// EMAIL LOWERCASE
//=====================================================

function initializeEmailField() {

    const emailField =
        document.getElementById(
            "studentEmail"
        );


    if (
        !emailField ||
        emailField.dataset.emailInitialized ===
        "true"
    ) {

        return;

    }


    emailField.dataset.emailInitialized =
        "true";


    emailField.addEventListener(
        "blur",
        () => {

            emailField.value =
                emailField
                    .value
                    .toLowerCase();

        }
    );

}


//=====================================================
// RESET FORM
//=====================================================

function clearRegistrationForm() {

    const form =
        document.getElementById(
            "registerForm"
        );


    if (form) {

        form.reset();

    }


    const passwordField =
        document.getElementById(
            "password"
        );


    const confirmPasswordField =
        document.getElementById(
            "confirmPassword"
        );


    if (passwordField) {

        passwordField
            .style
            .borderColor =
            "#ccc";

    }


    if (
        confirmPasswordField
    ) {

        confirmPasswordField
            .style
            .borderColor =
            "#ccc";

    }

}


//=====================================================
// ENTER KEY
//=====================================================

function initializeEnterKey() {

    const form =
        document.getElementById(
            "registerForm"
        );


    if (
        !form ||
        form.dataset.enterInitialized ===
        "true"
    ) {

        return;

    }


    form.dataset.enterInitialized =
        "true";


    form.addEventListener(
        "keypress",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                form.requestSubmit();

            }

        }
    );

}


//=====================================================
// START REGISTRATION PAGE
//=====================================================

function startRegistrationPage() {

    initializeRegistration();

    initializePasswordValidation();

    initializeConfirmPassword();

    initializeStudentName();

    initializeStudentId();

    initializeEmailField();

    initializeEnterKey();


    const studentNameField =
        document.getElementById(
            "studentName"
        );


    if (studentNameField) {

        studentNameField.focus();

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
        startRegistrationPage,
        {
            once: true
        }
    );

}

else {

    startRegistrationPage();

}


//=====================================================
// MAKE RESET AVAILABLE IF NEEDED
//=====================================================

window.clearRegistrationForm =
    clearRegistrationForm;