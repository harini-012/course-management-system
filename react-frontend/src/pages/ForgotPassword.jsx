
import { useState } from "react";
import { Link } from "react-router-dom";
import PageCss from "../components/PageCss";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001"
).replace(/\/+$/, "");

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

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
        throw new Error(result.message || "Request failed");
      }

      setMessage(result.message);
      setEmail("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageCss href="/css/forgot_password.css" />

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

          {message && (
            <div
              role="status"
              style={{
                padding: "14px",
                background: "#eff6ff",
                color: "#1e40af",
                borderRadius: "8px",
                marginBottom: "15px"
              }}
            >
              {message}
            </div>
          )}

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

          <p style={{ marginTop: "18px" }}>
            Your administrator will review the request.
            After identity verification, you can receive
            a temporary password privately.
          </p>

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
