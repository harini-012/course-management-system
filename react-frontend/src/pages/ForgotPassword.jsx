
import { useState } from "react";
import { Link } from "react-router-dom";
import PageCss from "../components/PageCss";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001"
).replace(/\/+$/, "");

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [statusEmail, setStatusEmail] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [resetting, setResetting] = useState(false);

  // STEP 1: Student submits password reset request
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setStatus("");
    setStatusMessage("");
    setResetMessage("");
    setTrackingCode("");

    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/password-reset/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Request failed"
        );
      }

      setMessage(result.message);
      setTrackingCode(result.trackingCode || "");
      setStatusEmail(email);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // STEP 2: Student checks request status
  async function checkStatus(e) {
    e.preventDefault();
    setChecking(true);
    setStatus("");
    setStatusMessage("");
    setResetMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/password-reset/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: statusEmail,
            trackingCode
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to check status"
        );
      }

      setStatus(result.status);
      setStatusMessage(result.message);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setChecking(false);
    }
  }

  // STEP 3: Student creates new password after approval
  async function completeReset(e) {
    e.preventDefault();
    setResetMessage("");

    if (
      newPassword.length < 8 ||
      newPassword.length > 72
    ) {
      setResetMessage(
        "Password must contain 8–72 characters"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetMessage("Passwords do not match");
      return;
    }

    setResetting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/password-reset/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: statusEmail,
            trackingCode,
            newPassword
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to reset password"
        );
      }

      setResetMessage(result.message);
      setStatus("completed");
      setStatusMessage("");
      setNewPassword("");
      setConfirmPassword("");
      setTrackingCode("");
    } catch (error) {
      setResetMessage(error.message);
    } finally {
      setResetting(false);
    }
  }

  return (
    <>
      <PageCss href="/css/forgot_password.css" />
      <PageCss href="/css/password_reset_status.css" />

      <div className="container">
        <div className="left">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop"
            alt="Forgot password"
          />
        </div>

        <div className="right">
          <h2>Forgot Password</h2>

          <p>
            Enter your registered student email to
            request a password reset.
          </p>

          {/* STEP 1: REQUEST RESET */}
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <label htmlFor="email">
                Registered Student Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading
                ? "Submitting..."
                : "Request Password Reset"}
            </button>
          </form>

          {message && (
            <p className="prs-message" role="status">
              {message}
            </p>
          )}

          {/* TRACKING CODE */}
          {trackingCode && (
            <div className="prs-tracking">
              <h3>Your Tracking Code</h3>

              <p>
                Save this code securely. You will need
                it to check your request status.
              </p>

              <code>{trackingCode}</code>

              <button
                type="button"
                className="prs-copy"
                onClick={() =>
                  navigator.clipboard
                    .writeText(trackingCode)
                    .catch(() =>
                      setMessage(
                        "Copy failed. Please select the code manually."
                      )
                    )
                }
              >
                Copy Tracking Code
              </button>
            </div>
          )}

          {/* STEP 2: CHECK STATUS */}
          <div className="prs-status-section">
            <h3>Check Request Status</h3>

            <p>
              Enter your email and tracking code to
              check whether your administrator has
              approved the request.
            </p>

            <form onSubmit={checkStatus}>
              <div className="input-box">
                <label htmlFor="status-email">
                  Student Email
                </label>

                <input
                  id="status-email"
                  type="email"
                  placeholder="Enter registered email"
                  value={statusEmail}
                  onChange={e => {
                    setStatusEmail(e.target.value);
                    setStatus("");
                  }}
                  required
                />
              </div>

              <div className="input-box">
                <label htmlFor="tracking-code">
                  Tracking Code
                </label>

                <input
                  id="tracking-code"
                  type="text"
                  placeholder="Enter tracking code"
                  value={trackingCode}
                  onChange={e => {
                    setTrackingCode(e.target.value.trim());
                    setStatus("");
                  }}
                  autoComplete="off"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={checking}
              >
                {checking
                  ? "Checking..."
                  : "Check Status"}
              </button>
            </form>

            {/* DISPLAY STATUS */}
            {statusMessage && (
              <div
                className="prs-result"
                role="status"
              >
                {status && (
                  <span
                    className={`prs-badge prs-${status}`}
                  >
                    {status.toUpperCase()}
                  </span>
                )}

                <p>{statusMessage}</p>
              </div>
            )}

            {/* STEP 3: SET NEW PASSWORD */}
            {status === "approved" && (
              <div className="prs-new-password">
                <h3>Create New Password</h3>

                <p>
                  Your administrator has approved
                  your request. Enter a new password
                  to complete the reset.
                </p>

                <form onSubmit={completeReset}>
                  <div className="input-box">
                    <label htmlFor="new-password">
                      New Password
                    </label>

                    <input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={e =>
                        setNewPassword(e.target.value)
                      }
                      minLength={8}
                      maxLength={72}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div className="input-box">
                    <label htmlFor="confirm-password">
                      Confirm New Password
                    </label>

                    <input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={e =>
                        setConfirmPassword(e.target.value)
                      }
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetting}
                  >
                    {resetting
                      ? "Updating Password..."
                      : "Set New Password"}
                  </button>
                </form>
              </div>
            )}

            {resetMessage && (
              <p
                className="prs-message"
                role="status"
              >
                {resetMessage}
              </p>
            )}

            {status === "completed" && (
              <p>
                <Link to="/login">
                  Login with your new password
                </Link>
              </p>
            )}
          </div>

          <div className="back">
            <Link to="/login">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
