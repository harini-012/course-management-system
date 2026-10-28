
/* =====================================================
   RESET PASSWORD - LOCAL MONGODB DEMO
   ===================================================== */

const AUTH_API = "http://localhost:3001/api/v1/auth";

let resetEmail = null;
let resetRole = null;

function initializeResetPassword() {
  const saved = sessionStorage.getItem("localDemoReset");

  if (saved) {
    try {
      const data = JSON.parse(saved);
      resetEmail = data.email;
      resetRole = data.role;
    } catch (error) {
      console.error("Invalid reset state:", error);
    }
  }

  if (
    !resetEmail ||
    !["student", "admin"].includes(resetRole)
  ) {
    showMessage(
      "Reset session missing. Please verify your email first.",
      "error"
    );

    setTimeout(() => {
      window.location.replace("/forgot-password");
    }, 1200);

    return;
  }

  setText("resetEmailDisplay", resetEmail);
  setText("emailDisplay", resetEmail);
  setText("userEmail", resetEmail);

  const form = document.getElementById("resetPasswordForm");

  if (!form) {
    console.error("Reset Password Form Not Found.");
    return;
  }

  if (form.dataset.initialized !== "true") {
    form.dataset.initialized = "true";
    form.addEventListener("submit", handleResetPassword);
  }

  initializePasswordFields();
}

async function handleResetPassword(event) {
  event.preventDefault();

  const passwordField =
    document.getElementById("newPassword") ||
    document.getElementById("password");

  const confirmField =
    document.getElementById("confirmPassword") ||
    document.getElementById("confirmNewPassword");

  if (!passwordField || !confirmField) {
    showMessage("Password fields not found.", "error");
    return;
  }

  const newPassword = passwordField.value;
  const confirmPassword = confirmField.value;

  if (
    newPassword.length < 8 ||
    newPassword.length > 72
  ) {
    showMessage(
      "Password must contain 8 to 72 characters.",
      "error"
    );
    return;
  }

  if (newPassword !== confirmPassword) {
    showMessage("Passwords do not match.", "error");
    return;
  }

  if (!resetEmail || !resetRole) {
    showMessage("Reset session is invalid.", "error");
    return;
  }

  setButtonLoading(true);

  try {
    const response = await fetch(
      `${AUTH_API}/dev/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: resetEmail,
          role: resetRole,
          newPassword
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Password reset failed"
      );
    }

    sessionStorage.removeItem("localDemoReset");

    resetEmail = null;
    resetRole = null;

    showMessage(
      "Password reset successful! Redirecting to Login...",
      "success"
    );

    document.getElementById("resetPasswordForm")?.reset();

    setTimeout(() => {
      window.location.replace("/login");
    }, 1000);

  } catch (error) {
    console.error("Reset Password Error:", error);
    showMessage(error.message, "error");
  } finally {
    setButtonLoading(false);
  }
}

function initializePasswordFields() {
  const passwordField =
    document.getElementById("newPassword") ||
    document.getElementById("password");

  const confirmField =
    document.getElementById("confirmPassword") ||
    document.getElementById("confirmNewPassword");

  if (passwordField) {
    passwordField.addEventListener("input", () => {
      const password = passwordField.value;
      const strength = document.getElementById(
        "passwordStrength"
      );

      passwordField.style.borderColor =
        !password ? "" :
        password.length < 8 ? "#dc2626" :
        "#16a34a";

      if (!strength) return;

      let score = 0;

      if (password.length >= 8) score++;
      if (password.length >= 12) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      strength.textContent =
        !password ? "" :
        score <= 2 ? "Weak Password" :
        score <= 3 ? "Medium Password" :
        "Strong Password";

      strength.style.color =
        score <= 2 ? "#dc2626" :
        score <= 3 ? "#f59e0b" :
        "#16a34a";
    });
  }

  if (confirmField && passwordField) {
    confirmField.addEventListener("input", () => {
      confirmField.style.borderColor =
        !confirmField.value ? "" :
        confirmField.value === passwordField.value
          ? "#16a34a"
          : "#dc2626";
    });
  }
}

function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);

  if (field) {
    field.type =
      field.type === "password" ? "text" : "password";
  }
}

function showMessage(message, type = "error") {
  const box =
    document.getElementById("message") ||
    document.getElementById("messageBox") ||
    document.getElementById("resetMessage");

  if (!box) {
    alert(message);
    return;
  }

  box.textContent = message;
  box.style.display = "block";
  box.style.color =
    type === "success" ? "#15803d" : "#dc2626";

  box.classList.remove("success", "error");
  box.classList.add(type);
}

function setButtonLoading(loading) {
  const button = document.querySelector(
    '#resetPasswordForm button[type="submit"]'
  );

  if (!button) return;

  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent;
  }

  button.disabled = loading;
  button.textContent = loading
    ? "Resetting..."
    : button.dataset.originalText;
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function goToLogin() {
  sessionStorage.removeItem("localDemoReset");
  window.location.href = "/login";
}

function backToForgotPassword() {
  sessionStorage.removeItem("localDemoReset");
  window.location.href = "/forgot-password";
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeResetPassword,
    { once: true }
  );
} else {
  initializeResetPassword();
}

window.handleResetPassword = handleResetPassword;
window.togglePassword = togglePassword;
window.goToLogin = goToLogin;
window.backToForgotPassword = backToForgotPassword;
