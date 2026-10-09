import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "80px", color: "#e63946" }}>
        404
      </h1>

      <h2>Page Not Found</h2>

      <p>The page you are looking for does not exist.</p>

      <Link to="/login">
        Go to Login
      </Link>
    </div>
  );
}