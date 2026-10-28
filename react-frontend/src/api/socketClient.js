import { io } from "socket.io-client";

const SOCKET_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

export function connectSocket() {
  const token = sessionStorage.getItem("token");

  if (!token) {
    throw new Error("Login required");
  }

  return io(SOCKET_URL, {
    auth: { token },
    autoConnect: true
  });
}