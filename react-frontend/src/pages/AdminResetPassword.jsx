
import { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001"
).replace(/\/+$/, "");

export default function AdminResetPassword() {
  const [studentEmail, setStudentEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (newPassword.length < 8 || newPassword.length > 72) {
      setMessage("Password must contain 8–72 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      setMessage("Please log in as administrator");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/admin/reset-student-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            studentEmail,
            newPassword
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Reset failed");
      }

      setMessage("Student password reset successfully!");
      setStudentEmail("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      maxWidth: 450,
      margin: "60px auto",
      padding: 30,
      borderRadius: 12,
      boxShadow: "0 4px 20px #0002"
    }}>
      <h2>Reset Student Password</h2>
      <p>Administrator password reset</p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Student Registered Email"
          value={studentEmail}
          onChange={e => setStudentEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="New Temporary Password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}

      <Link to="/admin-dashboard">
        Back to Admin Dashboard
      </Link>
    </div>
  );
}
