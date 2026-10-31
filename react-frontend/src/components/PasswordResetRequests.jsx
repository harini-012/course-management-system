
import { useCallback, useEffect, useState } from "react";


const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001"
).replace(/\/+$/, "");

export default function PasswordResetRequests() {
  const [requests, setRequests] = useState([]);
 
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/api/v1/auth/admin/password-reset-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load requests");
      }

      setRequests(data);
    } catch (error) {
      setMessage(error.message);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  
async function handleAction(id, action) {
  if (action === "approve") {
    if (
      !window.confirm(
        "Have you verified the student's identity and approved this request?"
      )
    ) {
      return;
    }
  } else {
    if (!window.confirm("Reject this request?")) {
      return;
    }
  }

  setLoading(true);
  setMessage("");

  try {
    const token = sessionStorage.getItem("token");

    const response = await fetch(
      `${API_URL}/api/v1/auth/admin/password-reset-requests/${id}/${action}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({})
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Operation failed"
      );
    }

    setMessage(result.message);
    await loadRequests();
  } catch (error) {
    setMessage(error.message);
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="section password-requests">
      <div className="pr-header">
        <div>
          <h2>Password Reset Requests</h2>
          <p>Review requests submitted by students</p>
        </div>

        <span className="pr-badge">
          {requests.length} Pending
        </span>
      </div>

      {message && (
        <p className="pr-message" role="status">
          {message}
        </p>
      )}

      <button
        type="button"
        className="pr-refresh"
        onClick={loadRequests}
      >
        Refresh Requests
      </button>

      {requests.length === 0 ? (
        <div className="pr-empty">
          No pending password reset requests.
        </div>
      ) : (
        <div className="pr-list">
          {requests.map(request => (
            <div className="pr-card" key={request.id}>
              <div className="pr-student">
                <h3>{request.studentName}</h3>
                <p>{request.studentEmail}</p>
                <small>
                  Requested:{" "}
                  {new Date(
                    request.createdAt
                  ).toLocaleString()}
                </small>
              </div>

              
<div className="pr-actions">
  <button
    type="button"
    className="pr-approve"
    disabled={loading}
    onClick={() =>
      handleAction(request.id, "approve")
    }
  >
    Approve Request
  </button>

  <button
    type="button"
    className="pr-reject"
    disabled={loading}
    onClick={() =>
      handleAction(request.id, "reject")
    }
  >
    Reject
  </button>
</div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
