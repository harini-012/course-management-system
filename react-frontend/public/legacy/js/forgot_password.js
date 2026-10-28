
/* =====================================================
   FORGOT PASSWORD - LOCAL MONGODB DEMO
   ===================================================== */

const AUTH_API = "http://localhost:3001/api/v1/auth";

function initializeForgotPassword() {
  const form = document.getElementById("forgotPasswordForm");

  if (!form || form.dataset.initialized === "true") {
    return;
  }

  form.dataset.initialized = "true";
  form.addEventListener("submit", handleForgotPassword);
}

async function handleForgotPassword(event) {
  event.preventDefault();

  const emailField = document.getElementById("email");
  const roleField = document.querySelector(
    'input[name="role"]:checked'
  );

  const email = String(emailField?.value || "")
    .trim()
    .toLowerCase();

  const role = String(roleField?.value || "")
    .trim()
    .toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage("Please enter a valid email address.", "error");
    emailField?.focus();
    return;
  }

  if (!["student", "admin"].includes(role)) {
    showMessage("Please select Student or Admin.", "error");
    return;
  }

  setButtonLoading(true);

  try {
    const response = await fetch(
      `${AUTH_API}/dev/check-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, role })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to verify email"
      );
    }

    // Store only the selected account details.
    // This is not proof of account ownership.
    sessionStorage.setItem(
      "localDemoReset",
      JSON.stringify({ email, role })
    );

    showMessage(
      "Email verified! Redirecting to Reset Password...",
      "success"
    );

    setTimeout(() => {
      window.location.replace("/reset-password");
    }, 800);

  } catch (error) {
    console.error("Forgot Password Error:", error);
    showMessage(error.message, "error");
  } finally {
    setButtonLoading(false);
  }
}

function showMessage(message, type = "error") {
  const box = document.getElementById("message");

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
  const button =
    document.getElementById("resetBtn") ||
    document.querySelector(
      '#forgotPasswordForm button[type="submit"]'
    );

  if (!button) return;

  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent;
  }

  button.disabled = loading;
  button.textContent = loading
    ? "Verifying..."
    : button.dataset.originalText;
}

function goToLogin() {
  window.location.href = "/login";
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeForgotPassword,
    { once: true }
  );
} else {
  initializeForgotPassword();
}

window.handleForgotPassword = handleForgotPassword;
window.goToLogin = goToLogin;
