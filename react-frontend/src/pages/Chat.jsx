
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import PageShell from "../components/PageShell";
import PageCss from "../components/PageCss";
import { connectSocket } from "../api/socketClient";

export default function Chat() {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [recipient, setRecipient] = useState("");
  const [activeRecipient, setActiveRecipient] = useState("");

  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [status, setStatus] = useState("Connecting");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const activeRecipientRef = useRef("");
  const bottomRef = useRef(null);
  const historyRequestRef = useRef(0);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001";

  // ================= LOAD STUDENTS =================

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setLoadingStudents(false);
      setError("Please log in first.");
      return;
    }

    const controller = new AbortController();

    async function loadStudents() {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/chat/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load students");
        }

        const data = await response.json();

        setStudents(
          Array.isArray(data.students) ? data.students : []
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingStudents(false);
        }
      }
    }

    loadStudents();

    return () => controller.abort();
  }, [API_URL]);

  // ================= SOCKET CONNECTION =================

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      setStatus("Disconnected");
      return;
    }

    const socket = connectSocket();
    socketRef.current = socket;

    function handleConnect() {
      setStatus("Connected");
      setError("");

      socket.emit("get_notifications", (response) => {
        if (response?.success) {
          setNotifications(response.notifications || []);
        }
      });

      if (activeRecipientRef.current) {
        socket.emit(
          "get_chat_history",
          { userId: activeRecipientRef.current },
          (response) => {
            if (response?.success) {
              setMessages(response.messages || []);
            }
          }
        );
      }
    }

    function handleDisconnect() {
      setStatus("Disconnected");
    }

    function handleConnectError(err) {
      setStatus("Disconnected");
      setError(err.message);
    }

    function handleNewMessage(message) {
      if (
        message.sender === activeRecipientRef.current
      ) {
        setMessages((previous) => {
          if (previous.some((item) => item._id === message._id)) {
            return previous;
          }

          return [...previous, message];
        });
      }
    }

    function handleNewNotification(notification) {
      setNotifications((previous) => {
        if (
          previous.some(
            (item) => item._id === notification._id
          )
        ) {
          return previous;
        }

        return [notification, ...previous];
      });
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("new_message", handleNewMessage);
    socket.on("new_notification", handleNewNotification);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // ================= AUTO SCROLL =================

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }, [messages]);

  // ================= OPEN CHAT =================

  function loadHistory() {
    const userId = recipient.trim();

    if (!userId) {
      setError("Please select a student.");
      return;
    }

    if (!socketRef.current?.connected) {
      setError("Socket is disconnected.");
      return;
    }

    setError("");
    setMessages([]);
    setActiveRecipient(userId);
    activeRecipientRef.current = userId;

    const requestId = ++historyRequestRef.current;

    socketRef.current.emit(
      "get_chat_history",
      { userId },
      (response) => {
        if (
          requestId !== historyRequestRef.current ||
          activeRecipientRef.current !== userId
        ) {
          return;
        }

        if (response?.success) {
          setMessages((previous) => {
            const combined = [
              ...(response.messages || []),
              ...previous
            ];

            const unique = Array.from(
              new Map(
                combined.map((message) => [
                  message._id,
                  message
                ])
              ).values()
            );

            return unique.sort(
              (a, b) =>
                new Date(a.createdAt) -
                new Date(b.createdAt)
            );
          });
        } else {
          setError(
            response?.message || "Could not load chat."
          );
        }
      }
    );
  }

  // ================= SEND MESSAGE =================

  function sendMessage(event) {
    event.preventDefault();

    const userId = activeRecipient;
    const messageText = text.trim();

    if (!userId) {
      setError("Please open a student chat first.");
      return;
    }

    if (!messageText || sending) return;

    if (!socketRef.current?.connected) {
      setError("Socket is disconnected.");
      return;
    }

    setSending(true);

    socketRef.current
      .timeout(10000)
      .emit(
        "send_message",
        {
          recipient: userId,
          text: messageText
        },
        (err, response) => {
          setSending(false);

          if (err) {
            setError("Message timed out. Please try again.");
            return;
          }

          if (response?.success) {
            setMessages((previous) => {
              if (
                previous.some(
                  (item) =>
                    item._id === response.message._id
                )
              ) {
                return previous;
              }

              return [...previous, response.message];
            });

            setText("");
            setError("");
          } else {
            setError(
              response?.message || "Message failed."
            );
          }
        }
      );
  }

  const selectedStudent = students.find(
    (student) => student.id === activeRecipient
  );

  // ================= STYLES =================

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 8px 24px rgba(30,64,175,0.08)",
    overflow: "hidden"
  };

  const buttonStyle = {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "9px",
    padding: "12px 18px",
    fontWeight: 600,
    cursor: "pointer"
  };

  const inputStyle = {
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#334155",
    minWidth: 0
  };

  // ================= PAGE =================

  return (
    <>
      <PageCss href="/css/student_dashboard.css" />

      <PageShell variant="student3">
        <main
          style={{
            background: "#f3f7ff",
            minHeight: "75vh",
            padding: "36px 20px",
            fontFamily: "Arial, sans-serif"
          }}
        >
          <div
            style={{
              maxWidth: "1150px",
              margin: "0 auto"
            }}
          >
            {/* ================= HEADER ================= */}

            <Link
              to="/student-dashboard"
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 600
              }}
            >
              ← Back to Dashboard
            </Link>

            <div style={{ margin: "24px 0" }}>
              <h1
                style={{
                  color: "#1e3a8a",
                  fontSize: "30px",
                  marginBottom: "8px"
                }}
              >
                Student Chat
              </h1>

              <p style={{ color: "#64748b" }}>
                Connect with students, send messages,
                and receive notifications in real time.
              </p>
            </div>

            {/* ================= MAIN GRID ================= */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
                gap: "22px",
                alignItems: "start"
              }}
            >
              {/* ================= CHAT CARD ================= */}

              <section style={cardStyle}>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg,#2563eb,#1d4ed8)",
                    color: "#ffffff",
                    padding: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px"
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "20px"
                    }}
                  >
                    Messages
                  </h2>

                  <span
                    style={{
                      fontSize: "12px",
                      padding: "6px 10px",
                      borderRadius: "20px",
                      background:
                        status === "Connected"
                          ? "#dcfce7"
                          : "#fee2e2",
                      color:
                        status === "Connected"
                          ? "#166534"
                          : "#991b1b"
                    }}
                  >
                    ● {status}
                  </span>
                </div>

                <div style={{ padding: "20px" }}>
                  {/* ================= SELECT STUDENT ================= */}

                  <label
                    htmlFor="chat-student"
                    style={{
                      display: "block",
                      fontWeight: 600,
                      marginBottom: "8px",
                      color: "#334155"
                    }}
                  >
                    Select Student
                  </label>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap"
                    }}
                  >
                    <select
                      id="chat-student"
                      value={recipient}
                      onChange={(event) =>
                        setRecipient(event.target.value)
                      }
                      disabled={loadingStudents}
                      style={{
                        ...inputStyle,
                        flex: "1 1 180px"
                      }}
                    >
                      <option value="">
                        {loadingStudents
                          ? "Loading students..."
                          : "Select a student"}
                      </option>

                      {students.map((student) => (
                        <option
                          key={student.id}
                          value={student.id}
                        >
                          {student.name ||
                            student.email ||
                            "Student"}

                          {student.name && student.email
                            ? ` (${student.email})`
                            : ""}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={loadHistory}
                      disabled={
                        !recipient ||
                        status !== "Connected"
                      }
                      style={{
                        ...buttonStyle,
                        opacity:
                          !recipient ||
                          status !== "Connected"
                            ? 0.5
                            : 1
                      }}
                    >
                      Open Chat
                    </button>
                  </div>

                  {/* ================= ACTIVE CHAT ================= */}

                  {activeRecipient && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "12px",
                        borderRadius: "10px",
                        background: "#eff6ff",
                        color: "#1e40af",
                        fontWeight: 600
                      }}
                    >
                      Chatting with:{" "}
                      {selectedStudent?.name ||
                        selectedStudent?.email ||
                        "Student"}
                    </div>
                  )}

                  {/* ================= MESSAGES ================= */}

                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "12px",
                      marginTop: "20px",
                      padding: "14px",
                      height: "350px",
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}
                  >
                    {!activeRecipient ? (
                      <p
                        style={{
                          textAlign: "center",
                          color: "#64748b",
                          marginTop: "100px"
                        }}
                      >
                        Select a student and click Open Chat
                        to view your conversation.
                      </p>
                    ) : messages.length === 0 ? (
                      <p
                        style={{
                          textAlign: "center",
                          color: "#64748b",
                          marginTop: "100px"
                        }}
                      >
                        No messages yet.
                        Start the conversation!
                      </p>
                    ) : (
                      messages.map((message) => {
                        const received =
                          message.sender === activeRecipient;

                        return (
                          <div
                            key={message._id}
                            style={{
                              alignSelf: received
                                ? "flex-start"
                                : "flex-end",
                              background: received
                                ? "#e2e8f0"
                                : "#2563eb",
                              color: received
                                ? "#1e293b"
                                : "#ffffff",
                              padding: "10px 14px",
                              borderRadius: "12px",
                              maxWidth: "85%",
                              overflowWrap: "anywhere"
                            }}
                          >
                            <div>{message.text}</div>

                            <small
                              style={{
                                display: "block",
                                marginTop: "5px",
                                opacity: 0.75,
                                fontSize: "11px"
                              }}
                            >
                              {new Date(
                                message.createdAt
                              ).toLocaleString()}
                            </small>
                          </div>
                        );
                      })
                    )}

                    <div ref={bottomRef} />
                  </div>

                  {/* ================= SEND MESSAGE ================= */}

                  <form
                    onSubmit={sendMessage}
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "16px"
                    }}
                  >
                    <input
                      type="text"
                      value={text}
                      onChange={(event) =>
                        setText(event.target.value)
                      }
                      maxLength={2000}
                      disabled={!activeRecipient}
                      placeholder="Type your message..."
                      style={{
                        ...inputStyle,
                        flex: 1
                      }}
                    />

                    <button
                      type="submit"
                      disabled={
                        !activeRecipient ||
                        status !== "Connected" ||
                        sending
                      }
                      style={{
                        ...buttonStyle,
                        opacity:
                          !activeRecipient ||
                          status !== "Connected" ||
                          sending
                            ? 0.5
                            : 1
                      }}
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </form>

                  {error && (
                    <p
                      role="alert"
                      style={{
                        color: "#dc2626",
                        marginTop: "12px"
                      }}
                    >
                      {error}
                    </p>
                  )}
                </div>
              </section>

              {/* ================= NOTIFICATIONS ================= */}

              <section style={cardStyle}>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg,#1d4ed8,#1e40af)",
                    color: "#ffffff",
                    padding: "20px"
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "20px"
                    }}
                  >
                    Notifications
                  </h2>

                  <p
                    style={{
                      margin: "6px 0 0",
                      opacity: 0.9,
                      fontSize: "13px"
                    }}
                  >
                    {notifications.length} saved notifications
                  </p>
                </div>

                <div
                  style={{
                    padding: "20px",
                    maxHeight: "500px",
                    overflowY: "auto"
                  }}
                >
                  {notifications.length === 0 ? (
                    <p
                      style={{
                        color: "#64748b",
                        textAlign: "center",
                        padding: "30px"
                      }}
                    >
                      No notifications yet.
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        style={{
                          padding: "14px",
                          marginBottom: "12px",
                          borderRadius: "10px",
                          background: notification.isRead
                            ? "#f8fafc"
                            : "#eff6ff",
                          border: "1px solid #dbeafe"
                        }}
                      >
                        <strong
                          style={{
                            color: "#1e40af"
                          }}
                        >
                          New Message
                        </strong>

                        <p
  style={{
    color: "#334155",
    margin: "8px 0"
  }}
>
  {notification.message}
</p>

                        <small
                          style={{
                            color: "#64748b"
                          }}
                        >
                          {new Date(
                            notification.createdAt
                          ).toLocaleString()}
                        </small>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </PageShell>
    </>
  );
}
