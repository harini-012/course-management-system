
/* =====================================================
   STUDENT COURSE MANAGEMENT SYSTEM
   STUDENT REGISTRATION - MONGODB VERSION
   ===================================================== */

const AUTH_URL = "http://localhost:3001/api/v1/auth";

// =====================================================
// INITIALIZE REGISTRATION
// =====================================================

function initializeRegistration() {
  const form = document.getElementById("registerForm");

  if (!form) {
    console.error("Registration form not found.");
    return;
  }

  if (form.dataset.registrationInitialized === "true") {
    return;
  }

  form.dataset.registrationInitialized = "true";
  form.addEventListener("submit", registerStudent);
}

// =====================================================
// REGISTER STUDENT
// =====================================================

async function registerStudent(event) {
  event.preventDefault();

  const form = document.getElementById("registerForm");

  const studentNameField =
    document.getElementById("studentName");

  const studentIdField =
    document.getElementById("studentId");

  const studentEmailField =
    document.getElementById("studentEmail");

  const departmentField =
    document.getElementById("department");

  const passwordField =
    document.getElementById("password");

  const confirmPasswordField =
    document.getElementById("confirmPassword");

  if (
    !form ||
    !studentNameField ||
    !studentIdField ||
    !studentEmailField ||
    !departmentField ||
    !passwordField ||
    !confirmPasswordField
  ) {
    console.error("Registration form fields are missing.");
    alert("Registration form is incomplete.");
    return;
  }

  const studentName = studentNameField.value.trim();
  const studentId = studentIdField.value.trim();

  const studentEmail = studentEmailField.value
    .trim()
    .toLowerCase();

  const department = departmentField.value;
  const password = passwordField.value;
  const confirmPassword = confirmPasswordField.value;

  // STUDENT NAME
  if (!studentName) {
    alert("Please enter Student Name.");
    studentNameField.focus();
    return;
  }

  if (studentName.length < 3) {
    alert("Student Name should contain at least 3 characters.");
    studentNameField.focus();
    return;
  }

  // STUDENT ID
  if (!studentId) {
    alert("Please enter Student ID.");
    studentIdField.focus();
    return;
  }

  if (studentId.length < 4) {
    alert("Student ID is too short.");
    studentIdField.focus();
    return;
  }

  // EMAIL
  if (!studentEmail) {
    alert("Please enter Email Address.");
    studentEmailField.focus();
    return;
  }

  if (!validateEmail(studentEmail)) {
    alert("Please enter a valid Email Address.");
    studentEmailField.focus();
    return;
  }

  // DEPARTMENT
  if (!department) {
    alert("Please select Department.");
    departmentField.focus();
    return;
  }

  // PASSWORD
  if (!password) {
    alert("Please enter Password.");
    passwordField.focus();
    return;
  }

  if (password.length < 8 || password.length > 72) {
    alert("Password must contain 8 to 72 characters.");
    passwordField.focus();
    return;
  }

  // CONFIRM PASSWORD
  if (!confirmPassword) {
    alert("Please confirm your Password.");
    confirmPasswordField.focus();
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    confirmPasswordField.focus();
    return;
  }

  const submitButton = form.querySelector(
    'button[type="submit"], input[type="submit"]'
  );

  const originalButtonText = submitButton
    ? submitButton.tagName === "INPUT"
      ? submitButton.value
      : submitButton.textContent
    : "";

  try {
    if (submitButton) {
      submitButton.disabled = true;

      if (submitButton.tagName === "INPUT") {
        submitButton.value = "Registering...";
      } else {
        submitButton.textContent = "Registering...";
      }
    }

    // Backend checks duplicate email and student ID.
    // No public GET /api/students request is needed.

    const response = await fetch(
      `${AUTH_URL}/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentName,
          studentId,
          email: studentEmail,
          department,
          password
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Student registration failed."
      );
    }

    alert("Student Registration Successful!");

    clearRegistrationForm();

    window.location.href = "/login";

  } catch (error) {
    console.error("Student registration error:", error);

    alert(
      error.message || "Unable to register student."
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;

      if (submitButton.tagName === "INPUT") {
        submitButton.value = originalButtonText;
      } else {
        submitButton.textContent = originalButtonText;
      }
    }
  }
}

// =====================================================
// EMAIL VALIDATION
// =====================================================

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =====================================================
// PASSWORD STRENGTH
// =====================================================

function initializePasswordValidation() {
  const passwordField =
    document.getElementById("password");

  if (
    !passwordField ||
    passwordField.dataset.passwordInitialized === "true"
  ) {
    return;
  }

  passwordField.dataset.passwordInitialized = "true";

  passwordField.addEventListener("input", () => {
    const password = passwordField.value;

    if (password.length === 0) {
      passwordField.style.borderColor = "#ccc";
    } else if (password.length < 8) {
      passwordField.style.borderColor = "red";
    } else if (password.length < 12) {
      passwordField.style.borderColor = "orange";
    } else {
      passwordField.style.borderColor = "green";
    }
  });
}

// =====================================================
// CONFIRM PASSWORD VALIDATION
// =====================================================

function initializeConfirmPassword() {
  const confirmPasswordField =
    document.getElementById("confirmPassword");

  const passwordField =
    document.getElementById("password");

  if (
    !confirmPasswordField ||
    !passwordField ||
    confirmPasswordField.dataset.confirmInitialized === "true"
  ) {
    return;
  }

  confirmPasswordField.dataset.confirmInitialized = "true";

  confirmPasswordField.addEventListener("input", () => {
    const password = passwordField.value;
    const confirmPassword = confirmPasswordField.value;

    if (!confirmPassword) {
      confirmPasswordField.style.borderColor = "#ccc";
    } else if (password === confirmPassword) {
      confirmPasswordField.style.borderColor = "green";
    } else {
      confirmPasswordField.style.borderColor = "red";
    }
  });
}

// =====================================================
// STUDENT NAME FORMATTING
// =====================================================

function initializeStudentName() {
  const field = document.getElementById("studentName");

  if (!field || field.dataset.nameInitialized === "true") {
    return;
  }

  field.dataset.nameInitialized = "true";

  field.addEventListener("input", () => {
    field.value = field.value.replace(/[^a-zA-Z\s]/g, "");
  });

  field.addEventListener("blur", () => {
    field.value = field.value
      .toLowerCase()
      .replace(/\b\w/g, letter => letter.toUpperCase());
  });
}

// =====================================================
// STUDENT ID FORMATTING
// =====================================================

function initializeStudentId() {
  const field = document.getElementById("studentId");

  if (!field || field.dataset.idInitialized === "true") {
    return;
  }

  field.dataset.idInitialized = "true";

  field.addEventListener("input", () => {
    field.value = field.value.replace(/\s/g, "");
  });
}

// =====================================================
// EMAIL FORMATTING
// =====================================================

function initializeEmailField() {
  const field = document.getElementById("studentEmail");

  if (!field || field.dataset.emailInitialized === "true") {
    return;
  }

  field.dataset.emailInitialized = "true";

  field.addEventListener("blur", () => {
    field.value = field.value.trim().toLowerCase();
  });
}

// =====================================================
// CLEAR REGISTRATION FORM
// =====================================================

function clearRegistrationForm() {
  const form = document.getElementById("registerForm");

  if (form) {
    form.reset();
  }

  const passwordField =
    document.getElementById("password");

  const confirmPasswordField =
    document.getElementById("confirmPassword");

  if (passwordField) {
    passwordField.style.borderColor = "#ccc";
  }

  if (confirmPasswordField) {
    confirmPasswordField.style.borderColor = "#ccc";
  }
}

// =====================================================
// ENTER KEY
// =====================================================

function initializeEnterKey() {
  const form = document.getElementById("registerForm");

  if (!form || form.dataset.enterInitialized === "true") {
    return;
  }

  form.dataset.enterInitialized = "true";

  form.addEventListener("keydown", event => {
    if (
      event.key === "Enter" &&
      event.target.tagName !== "TEXTAREA" &&
      event.target.tagName !== "BUTTON"
    ) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
}

// =====================================================
// START REGISTRATION PAGE
// =====================================================

function startRegistrationPage() {
  initializeRegistration();
  initializePasswordValidation();
  initializeConfirmPassword();
  initializeStudentName();
  initializeStudentId();
  initializeEmailField();
  initializeEnterKey();

  const nameField =
    document.getElementById("studentName");

  if (nameField) {
    nameField.focus();
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    startRegistrationPage,
    { once: true }
  );
} else {
  startRegistrationPage();
}

// =====================================================
// GLOBAL FUNCTIONS
// =====================================================

window.clearRegistrationForm = clearRegistrationForm;
