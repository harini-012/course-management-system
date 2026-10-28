
/* =====================================================
   STUDENT COURSE MANAGEMENT SYSTEM
   ADMIN REGISTRATION - MONGODB VERSION
   ===================================================== */

const AUTH_URL =
  "https://course-management-system-backend-pbbz.onrender.com/api/v1/auth";
// =====================================================
// REGISTER ADMIN
// =====================================================

async function registerAdmin(event) {
  event.preventDefault();

  const form =
    document.getElementById("adminRegisterForm");

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
    document.getElementById("adminConfirmPassword");

  if (
    !form ||
    !adminNameField ||
    !adminIdField ||
    !adminEmailField ||
    !designationField ||
    !passwordField ||
    !confirmPasswordField
  ) {
    console.error("Administrator registration fields not found.");
    alert("Administrator registration form is incomplete.");
    return;
  }

  const adminName = adminNameField.value.trim();
  const adminId = adminIdField.value.trim();

  const adminEmail = adminEmailField.value
    .trim()
    .toLowerCase();

  const designation = designationField.value;
  const password = passwordField.value;
  const confirmPassword = confirmPasswordField.value;

  // ADMIN NAME
  if (!adminName) {
    alert("Please enter Administrator Name.");
    adminNameField.focus();
    return;
  }

  if (adminName.length < 3) {
    alert("Administrator Name must contain at least 3 characters.");
    adminNameField.focus();
    return;
  }

  // ADMIN ID
  if (!adminId) {
    alert("Please enter Administrator ID.");
    adminIdField.focus();
    return;
  }

  if (adminId.length < 4) {
    alert("Administrator ID is too short.");
    adminIdField.focus();
    return;
  }

  // EMAIL
  if (!adminEmail) {
    alert("Please enter Email Address.");
    adminEmailField.focus();
    return;
  }

  if (!validateEmail(adminEmail)) {
    alert("Please enter a valid Email Address.");
    adminEmailField.focus();
    return;
  }

  // DESIGNATION
  if (!designation) {
    alert("Please select Designation.");
    designationField.focus();
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

    // Backend checks duplicate admin email and ID.

    const response = await fetch(
      `${AUTH_URL}/admin/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          adminName,
          adminId,
          email: adminEmail,
          designation,
          password
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Admin registration failed."
      );
    }

    alert("Administrator Registration Successful!");

    clearAdminForm();

    window.location.replace("/login");

  } catch (error) {
    console.error("Administrator Registration Error:", error);

    alert(
      error.message || "Unable to register Administrator."
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
// INITIALIZE ADMIN REGISTRATION
// =====================================================

function initializeAdminRegistration() {
  const form =
    document.getElementById("adminRegisterForm");

  if (!form) {
    console.error("Admin Registration Form Not Found.");
    return;
  }

  if (form.dataset.initialized === "true") {
    return;
  }

  form.dataset.initialized = "true";

  form.addEventListener("submit", registerAdmin);

  initializeAdminPasswordValidation();
  initializeAdminConfirmPassword();
  initializeAdminName();
  initializeAdminId();
  initializeAdminEmail();
  initializeAdminEnterKey();

  const adminNameField =
    document.getElementById("adminName");

  if (adminNameField) {
    adminNameField.focus();
  }
}

// =====================================================
// PASSWORD STRENGTH
// =====================================================

function initializeAdminPasswordValidation() {
  const field =
    document.getElementById("adminPassword");

  if (
    !field ||
    field.dataset.passwordInitialized === "true"
  ) {
    return;
  }

  field.dataset.passwordInitialized = "true";

  field.addEventListener("input", () => {
    const password = field.value;

    if (password.length === 0) {
      field.style.borderColor = "#ccc";
    } else if (password.length < 8) {
      field.style.borderColor = "red";
    } else if (password.length < 12) {
      field.style.borderColor = "orange";
    } else {
      field.style.borderColor = "green";
    }
  });
}

// =====================================================
// CONFIRM PASSWORD
// =====================================================

function initializeAdminConfirmPassword() {
  const confirmField =
    document.getElementById("adminConfirmPassword");

  const passwordField =
    document.getElementById("adminPassword");

  if (
    !confirmField ||
    !passwordField ||
    confirmField.dataset.confirmInitialized === "true"
  ) {
    return;
  }

  confirmField.dataset.confirmInitialized = "true";

  confirmField.addEventListener("input", () => {
    const password = passwordField.value;
    const confirmPassword = confirmField.value;

    if (!confirmPassword) {
      confirmField.style.borderColor = "#ccc";
    } else {
      confirmField.style.borderColor =
        password === confirmPassword
          ? "green"
          : "red";
    }
  });
}

// =====================================================
// ADMIN NAME
// =====================================================

function initializeAdminName() {
  const field = document.getElementById("adminName");

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
// ADMIN ID
// =====================================================

function initializeAdminId() {
  const field = document.getElementById("adminId");

  if (!field || field.dataset.idInitialized === "true") {
    return;
  }

  field.dataset.idInitialized = "true";

  field.addEventListener("input", () => {
    field.value = field.value.replace(/\s/g, "");
  });
}

// =====================================================
// EMAIL LOWERCASE
// =====================================================

function initializeAdminEmail() {
  const field = document.getElementById("adminEmail");

  if (
    !field ||
    field.dataset.emailInitialized === "true"
  ) {
    return;
  }

  field.dataset.emailInitialized = "true";

  field.addEventListener("blur", () => {
    field.value = field.value.trim().toLowerCase();
  });
}

// =====================================================
// ENTER KEY
// =====================================================

function initializeAdminEnterKey() {
  const form =
    document.getElementById("adminRegisterForm");

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
// CLEAR ADMIN FORM
// =====================================================

function clearAdminForm() {
  const form =
    document.getElementById("adminRegisterForm");

  if (form) {
    form.reset();
  }

  const passwordField =
    document.getElementById("adminPassword");

  const confirmPasswordField =
    document.getElementById("adminConfirmPassword");

  if (passwordField) {
    passwordField.style.borderColor = "#ccc";
  }

  if (confirmPasswordField) {
    confirmPasswordField.style.borderColor = "#ccc";
  }
}

// =====================================================
// LOGOUT ADMIN
// =====================================================

async function logoutAdmin() {
  sessionStorage.removeItem("courseManagementSession");
  sessionStorage.removeItem("token");

  window.location.replace("/login");
}

// =====================================================
// START PAGE
// =====================================================

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeAdminRegistration,
    { once: true }
  );
} else {
  initializeAdminRegistration();
}

// =====================================================
// GLOBAL FUNCTIONS
// =====================================================

window.clearAdminForm = clearAdminForm;
window.logoutAdmin = logoutAdmin;
