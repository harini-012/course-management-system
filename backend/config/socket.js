const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

function initializeSocket(httpServer) {
  const allowedOrigins = (
    process.env.CLIENT_URL || "http://localhost:5173"
  )
    .split(",")
    .map((origin) => origin.trim());

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"]
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
        { algorithms: ["HS256"] }
      );

      const userId = String(decoded.sub || "");
      const role = decoded.role;

      if (!userId || !["student", "admin"].includes(role)) {
        return next(new Error("Invalid authentication token"));
      }

      const collectionName =
        role === "admin" ? "admins" : "students";

      const user = await mongoose.connection.db
        .collection(collectionName)
        .findOne({
          id: userId,
          active: { $ne: false }
        });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = {
        id: userId,
        role,
        email: user.email
      };

      next();
    } catch {
      next(new Error("Invalid authentication token"));
    }
  });

  io.on("connection", (socket) => {
  socket.join(`user:${socket.user.id}`);

  console.log("Authenticated socket:", socket.user.id);

  socket.on("send_message", async (data, callback) => {
    try {
      const Message = require("../models/Message");
      const Notification = require("../models/Notification");

      const recipient = data?.recipient;
      const text = data?.text;

      if (
        typeof recipient !== "string" ||
        !recipient.trim() ||
        typeof text !== "string" ||
        !text.trim() ||
        text.length > 2000
      ) {
        return callback?.({
          success: false,
          message: "Invalid message data"
        });
      }

      const savedMessage = await Message.create({
        sender: socket.user.id,
        recipient: recipient.trim(),
        text: text.trim()
      });
const senderCollection =
  socket.user.role === "admin" ? "admins" : "students";

const senderDetails = await mongoose.connection.db
  .collection(senderCollection)
  .findOne(
    { id: socket.user.id },
    { projection: { name: 1, email: 1 } }
  );

const senderName =
  senderDetails?.name ||
  senderDetails?.email ||
  "A student";

const notification = await Notification.create({
  recipient,
  message: `${senderName} sent you a message`,
  isRead: false
});

      io.to(`user:${recipient.trim()}`).emit(
        "new_message",
        savedMessage
      );

      io.to(`user:${recipient.trim()}`).emit(
        "new_notification",
        notification
      );

      callback?.({
        success: true,
        message: savedMessage
      });

    } catch (error) {
      console.error("Message error:", error);

      callback?.({
        success: false,
        message: "Failed to send message"
      });
    }
  });
  socket.on("get_chat_history", async (data, callback) => {
    try {
      const Message = require("../models/Message");

      const otherUserId = data?.userId;

      if (
        typeof otherUserId !== "string" ||
        !otherUserId.trim()
      ) {
        return callback?.({
          success: false,
          message: "Valid user ID required"
        });
      }

      const currentUserId = socket.user.id;
      const otherId = otherUserId.trim();

      const messages = await Message.find({
        $or: [
          {
            sender: currentUserId,
            recipient: otherId
          },
          {
            sender: otherId,
            recipient: currentUserId
          }
        ]
      })
        .sort({ createdAt: 1 })
        .limit(100)
        .lean();

      callback?.({
        success: true,
        messages
      });

    } catch (error) {
      console.error("Chat history error:", error);

      callback?.({
        success: false,
        message: "Failed to load chat history"
      });
    }
  });
  socket.on("get_notifications", async (callback) => {
  try {
    const Notification = require("../models/Notification");

    const notifications = await Notification.find({
      recipient: socket.user.id
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    callback?.({
      success: true,
      notifications
    });
  } catch (error) {
    console.error("Notification history error:", error);

    callback?.({
      success: false,
      message: "Failed to load notifications"
    });
  }
});
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.user.id);
  });
});

  return io;
}

module.exports = initializeSocket;