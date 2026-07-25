//==========================================
// COURSE MANAGEMENT SYSTEM
// login.js
//==========================================

let currentRole = "student";

//==========================================
// PAGE LOAD
//==========================================

document.addEventListener("DOMContentLoaded", () => {

    showStudent();

    const loginBtn = document.querySelector(".login-btn");

    if (loginBtn) {
        loginBtn.addEventListener("click", loginUser);
    }

});

//==========================================
// STUDENT TAB
//==========================================

function showStudent() {

    currentRole = "student";

    document.getElementById("role").textContent = "Student Login";

    document.getElementById("studentBtn").classList.add("active");
    document.getElementById("adminBtn").classList.remove("active");

    document.getElementById("registerTitle").textContent =
        "New Student?";

    document.getElementById("registerText").textContent =
        "Don't have a student account?";

    document.getElementById("registerLink").textContent =
        "Student Register";

    document.getElementById("registerLink").href =
        "student_register.html";

}

//==========================================
// ADMIN TAB
//==========================================

function showAdmin() {

    currentRole = "admin";

    document.getElementById("role").textContent =
        "Administrator Login";

    document.getElementById("adminBtn").classList.add("active");
    document.getElementById("studentBtn").classList.remove("active");

    document.getElementById("registerTitle").textContent =
        "New Administrator?";

    document.getElementById("registerText").textContent =
        "Don't have an administrator account?";

    document.getElementById("registerLink").textContent =
        "Administrator Register";

    document.getElementById("registerLink").href =
        "admin_register.html";

}

//==========================================
// LOGIN
//==========================================

function loginUser() {

    const email =
        document.querySelector('input[type="email"]').value.trim();

    const password =
        document.querySelector('input[type="password"]').value.trim();

    //--------------------------------------

    if (email === "") {

        alert("Please enter Email.");

        return;
    }

    //--------------------------------------

    if (!validateEmail(email)) {

        alert("Enter a valid Email Address.");

        return;
    }

    //--------------------------------------

    if (password === "") {

        alert("Please enter Password.");

        return;
    }

    //--------------------------------------

    if (password.length < 6) {

        alert("Password must contain at least 6 characters.");

        return;
    }

    //--------------------------------------
    // STUDENT LOGIN
    //--------------------------------------

    if (currentRole === "student") {
        
        const students =
            JSON.parse(localStorage.getItem("students")) || [];

        const student = students.find(user =>

            user.email === email &&
            user.password === password

        );

        if (student) {

            localStorage.setItem("loggedInStudent",
                JSON.stringify(student));

            alert("Student Login Successful.");

            window.location.href =
                "student_dashboard.html";

        }

        else {

            alert("Invalid Student Email or Password.");

        }

    }

    //--------------------------------------
    // ADMIN LOGIN
    //--------------------------------------

    else {

        const admins =
            JSON.parse(localStorage.getItem("admins")) || [];

        const admin = admins.find(user =>

            user.email === email &&
            user.password === password

        );

        if (admin) {

            localStorage.setItem("loggedInAdmin",
                JSON.stringify(admin));

            alert("Administrator Login Successful.");

            window.location.href =
                "admin_dashboard.html";

        }

        else {

            alert("Invalid Administrator Email or Password.");

        }

    }

}

//==========================================
// EMAIL VALIDATION
//==========================================

function validateEmail(email) {

    const pattern =

        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email);

}

//==========================================
// ENTER KEY LOGIN
//==========================================

document.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {

        event.preventDefault();

        loginUser();

    }

});

//==========================================
// AUTO LOGIN CHECK
//==========================================

(function () {

    const student =
        localStorage.getItem("loggedInStudent");

    const admin =
        localStorage.getItem("loggedInAdmin");

    if (student &&
        window.location.pathname.includes("login.html")) {

        console.log("Student session available.");

    }

    if (admin &&
        window.location.pathname.includes("login.html")) {

        console.log("Admin session available.");

    }

})();

//==========================================
// LOGOUT FUNCTION
//==========================================

function logout() {

   

    alert("Logged Out Successfully.");

    window.location.href = "login.html";

}
//==========================================
// FUTURE BACKEND FLOW
//==========================================

/*

Login

↓

Validate Form

↓

API Call

↓

Database Verification

↓

JWT Token

↓

Role Verification

↓

Student Dashboard

or

Admin Dashboard

*/