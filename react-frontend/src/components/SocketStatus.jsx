
import { useEffect, useState } from "react";
import { connectSocket } from "../api/socketClient";

function SocketStatus() {
  const [status, setStatus] = useState("Connecting");

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      setStatus("Disconnected");
      return;
    }

    const socket = connectSocket();

    const handleConnect = () => setStatus("Connected");
    const handleDisconnect = () => setStatus("Disconnected");
    const handleError = () => setStatus("Disconnected");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!sessionStorage.getItem("token")) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        padding: "8px 14px",
        borderRadius: "8px",
        background:
          status === "Connected" ? "#dcfce7" : "#fee2e2",
        color:
          status === "Connected" ? "#166534" : "#991b1b",
        fontSize: "13px",
        fontWeight: "600",
        zIndex: 9999
      }}
    >
      {status === "Connected" ? "🟢" : "🔴"} Socket: {status}
    </div>
  );
}

export default SocketStatus;
