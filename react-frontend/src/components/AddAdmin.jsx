
import { useState } from "react";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001"
).replace(/\/+$/, "");

export default function AddAdmin() {
  const [form, setForm] = useState({
    adminName: "",
    adminId: "",
    email: "",
    designation: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Please log in as an administrator"
        );
      }

      const response = await fetch(
        `${API_URL}/api/v1/auth/admin/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(form)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to create administrator"
        );
      }

      setMessage(result.message);

      setForm({
        adminName: "",
        adminId: "",
        email: "",
        designation: "",
        password: ""
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section add-admin">
      <h2>Add New Administrator</h2>

      <p>
        Create a new administrator account.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="aa-grid">
          <input
            name="adminName"
            placeholder="Administrator Name"
            value={form.adminName}
            onChange={handleChange}
            required
          />

          <input
            name="adminId"
            placeholder="Administrator ID"
            value={form.adminId}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Administrator Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="designation"
            placeholder="Designation"
            value={form.designation}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Temporary Password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading
            ? "Creating Administrator..."
            : "Create Administrator"}
        </button>
      </form>

      {message && (
        <p role="status">{message}</p>
      )}
    </div>
  );
}
