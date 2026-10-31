
import { Link } from "react-router-dom";
import PageCss from "../components/PageCss";

export default function AdminRegister() {
  return (
    <>
      <PageCss href="/css/admin_register.css" />

      <div className="container">
        <Link to="/" className="back-btn">
          ← Back to Home
        </Link>

        <h2>LOGIN PORTAL</h2>

        <h2>Administrator Registration</h2>

        <div className="admin-registration-info">
          <div className="admin-info-icon">
            <span role="img" aria-label="Administrator">
              👨‍💼
            </span>
          </div>

          <h3>Administrator Registration is Restricted</h3>

          <p>
            For security reasons, new administrator
            accounts cannot be created through
            public self-registration.
          </p>

          <p>
            If you need an administrator account,
            please contact an existing administrator
            of the Course Management System.
          </p>

          <div className="admin-registration-steps">
            <h4>How to Get an Administrator Account</h4>

            <ol>
              <li>
                Contact an existing administrator.
              </li>

              <li>
                The existing administrator logs in
                to the Admin Dashboard.
              </li>

              <li>
                They select <strong>Add Administrator</strong>
                {" "}under Admin Tools.
              </li>

              <li>
                They enter your name, administrator ID,
                email, designation, and initial password.
              </li>

              <li>
                Once the account is created, you can
                log in using your administrator credentials.
              </li>
            </ol>
          </div>

          <p className="admin-security-note">
            Only authorized administrators can create
            new administrator accounts.
          </p>
        </div>

        <div className="login">
          <p>Already have an administrator account?</p>

          <Link to="/login">
            Login Here
          </Link>
        </div>
      </div>
    </>
  );
}
