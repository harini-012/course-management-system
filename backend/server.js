
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
const helmet = require("helmet");
const connectDB = require("./config/db");
const authRoutes = require("./authRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const learningProgressRoutes = require("./routes/learningProgressRoutes");
const morgan = require("morgan");
const http = require("node:http");
const initializeSocket = require("./config/socket");

const {
  authenticateToken,
  requireAdmin
} = require("./middleware/authMiddleware");

const validateCourse = require("./middleware/courseValidation");
const notFound = require("./middleware/notFoundMiddleware");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const httpServer = http.createServer(app);
initializeSocket(httpServer);

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(
        Object.assign(
          new Error("Origin not allowed by CORS"),
          { status: 403 }
        )
      );
    }
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(helmet());

app.use(morgan("dev"));
const allowedResources = new Set([
  "students",
  "admins",
  "courses",
  "enrollments",
  "progress",
  "sessions",
  "appState",
  "draftCourses"
]);

const sensitiveFields = [
  "password",
  "passwordHash",
  "token",
  "accessToken",
  "refreshToken"
];

function collection(resource) {
  return mongoose.connection.db.collection(resource);
}

function publicRecord(record) {
  if (!record) return record;

  const result = { ...record };
  delete result._id;

  for (const field of sensitiveFields) {
    delete result[field];
  }

  return result;
}

function publicRecords(records) {
  return records.map(publicRecord);
}

function validId(value) {
  return (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
  );
}

function cleanBody(body) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return null;
  }

  const result = { ...body };

  delete result._id;
  delete result.__v;
  delete result.$set;
  delete result.$unset;

  for (const key of Object.keys(result)) {
    if (key.startsWith("$") || key.includes(".")) {
      return null;
    }
  }

  return result;
}

function getToken(req) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) return null;

  const jwt = require("jsonwebtoken");

  try {
    const decoded = jwt.verify(
      header.slice(7).trim(),
      process.env.JWT_SECRET
    );

    return {
      id: String(decoded.sub),
      role: decoded.role,
      email: decoded.email
    };
  } catch {
    return null;
  }
}

function authorizeResource(req, res, next) {
  const resource = req.params.resource;

  if (!allowedResources.has(resource)) {
    return res.status(404).json({
      message: "Resource not found"
    });
  }

  // Legacy session and selected-course UI compatibility.
  // These routes must be secured before public deployment.
  if (
    resource === "sessions" ||
    resource === "appState"
  ) {
    return next();
  }

  const user = getToken(req);

  if (!user) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  req.user = user;

  if (user.role === "admin") {
    return next();
  }

  if (user.role !== "student") {
    return res.status(403).json({
      message: "Access denied"
    });
  }

  if (
    resource === "courses" &&
    ["GET", "HEAD"].includes(req.method)
  ) {
    return next();
  }

  if (
    resource === "students" &&
    req.params.id &&
    String(req.params.id) === user.id &&
    ["GET", "PATCH"].includes(req.method)
  ) {
    return next();
  }

  if (
    resource === "enrollments" ||
    resource === "progress"
  ) {
    if (req.method === "GET") {
      return next();
    }

    return res.status(403).json({
      message: "Use the authenticated enrollment or progress API"
    });
  }

  return res.status(403).json({
    message: "Access denied"
  });
}

function buildFilter(query) {
  const filter = {};
  const reserved = new Set([
    "_sort",
    "_order",
    "_limit",
    "_page",
    "_start",
    "_end"
  ]);

  for (const [key, value] of Object.entries(query)) {
    if (reserved.has(key)) continue;

    if (
      key === "_id" ||
      key.startsWith("$") ||
      key.includes(".") ||
      typeof value !== "string"
    ) {
      throw new Error("Invalid query filter");
    }

    filter[key] = value;
  }

  return filter;
}

function readOptions(query) {
  const options = {};

  if (query._sort) {
    const field = String(query._sort);

    if (
      field === "_id" ||
      field.startsWith("$") ||
      field.includes(".")
    ) {
      throw new Error("Invalid sort field");
    }

    options.sort = {
      [field]:
        String(query._order).toLowerCase() === "desc"
          ? -1
          : 1
    };
  }

  const limit = Number(query._limit);

  if (
    query._limit !== undefined &&
    Number.isInteger(limit) &&
    limit > 0
  ) {
    options.limit = Math.min(limit, 10000);
  }

  const page = Number(query._page);

  if (
    options.limit &&
    Number.isInteger(page) &&
    page > 1
  ) {
    options.skip = (page - 1) * options.limit;
  }

  return options;
}

app.get("/", (req, res) => {
  res.json({
    application: "Student Course Management System",
    backend: "Node.js + Express.js",
    database: "MongoDB",
    status: "running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected",
    timestamp: new Date().toISOString()
  });
});

app.get(
  "/api/mongo-test",
  authenticateToken,
  requireAdmin,
  async (req, res, next) => {
    try {
      const counts = {};

      for (const name of allowedResources) {
        counts[name] =
          await collection(name).countDocuments();
      }

      res.json({
        success: true,
        database: mongoose.connection.name,
        counts
      });
    } catch (error) {
      next(error);
    }
  }
);

/* ================= CHAT STUDENT LIST ================= */

app.get(
  "/api/v1/chat/students",
  authenticateToken,
  async (req, res, next) => {
    try {
      if (!["student", "admin"].includes(req.user.role)) {
        return res.status(403).json({
          message: "Access denied"
        });
      }

      const students = await collection("students")
        .find(
          {
            id: { $ne: String(req.user.id) },
            active: { $ne: false }
          },
          {
            projection: {
              _id: 0,
              id: 1,
              name: 1,
              email: 1
            }
          }
        )
        .sort({ name: 1, email: 1 })
        .limit(200)
        .toArray();

      res.json({
        success: true,
        students
      });
    } catch (error) {
      next(error);
    }
  }
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/progress", learningProgressRoutes);

// Keep the existing versioned course URLs.
app.use((req, res, next) => {
  if (/^\/api\/v1\/courses(?:\/|\?|$)/.test(req.url)) {
    req.url = req.url.replace(
      /^\/api\/v1\/courses/,
      "/api/courses"
    );
  }

  next();
});

// Public course catalogue, as in the existing application.
app.get("/api/courses", async (req, res, next) => {
  try {
    const filter = buildFilter(req.query);
    const options = readOptions(req.query);

    let cursor = collection("courses")
      .find(filter, { projection: { _id: 0 } });

    if (options.sort) cursor = cursor.sort(options.sort);
    if (options.skip) cursor = cursor.skip(options.skip);
    if (options.limit) cursor = cursor.limit(options.limit);

    res.json(await cursor.toArray());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/courses/:id", async (req, res, next) => {
  try {
    const record = await collection("courses").findOne(
      { id: req.params.id },
      { projection: { _id: 0 } }
    );

    if (!record) {
      return res.status(404).json({
        message: "Course not found"
      });
    }

    res.json(record);
  } catch (error) {
    next(error);
  }
});

// All other collection reads.
app.get(
  "/api/:resource",
  authorizeResource,
  async (req, res, next) => {
    try {
      const { resource } = req.params;
      const filter = buildFilter(req.query);
      const options = readOptions(req.query);

      // A student can only see their own enrollment
      // and progress records.
      if (
        req.user?.role === "student" &&
        ["enrollments", "progress"].includes(resource)
      ) {
        const student = await collection("students")
          .findOne({ id: req.user.id });

        if (!student) {
          return res.status(403).json({
            message: "Student unavailable"
          });
        }

        const records = await collection(resource)
          .find({}, { projection: { _id: 0 } })
          .toArray();

        const own = records.filter(record => {
          if (record.studentId != null) {
            return String(record.studentId) === req.user.id;
          }

          return Boolean(
            record.studentEmail &&
            student.email &&
            String(record.studentEmail).toLowerCase() ===
              String(student.email).toLowerCase()
          );
        });

        return res.json(publicRecords(own));
      }

      let cursor = collection(resource)
        .find(filter, { projection: { _id: 0 } });

      if (options.sort) cursor = cursor.sort(options.sort);
      if (options.skip) cursor = cursor.skip(options.skip);
      if (options.limit) cursor = cursor.limit(options.limit);

      res.json(publicRecords(await cursor.toArray()));
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

app.get(
  "/api/:resource/:id",
  authorizeResource,
  async (req, res, next) => {
    try {
      const { resource, id } = req.params;

      const record = await collection(resource).findOne(
        { id },
        { projection: { _id: 0 } }
      );

      if (!record) {
        return res.status(404).json({
          message: "Record not found"
        });
      }

      if (
        req.user?.role === "student" &&
        ["enrollments", "progress"].includes(resource) &&
        String(record.studentId) !== req.user.id
      ) {
        return res.status(403).json({
          message: "Access denied"
        });
      }

      res.json(publicRecord(record));
    } catch (error) {
      next(error);
    }
  }
);

// Create a record.
app.post(
  "/api/:resource",
  authorizeResource,
  (req, res, next) => {
    if (req.params.resource === "courses") {
      return validateCourse(req, res, next);
    }

    next();
  },
  async (req, res, next) => {
    try {
      const { resource } = req.params;
      const body = cleanBody(req.body);

      if (!body) {
        return res.status(400).json({
          message: "Invalid record"
        });
      }
      if (
  ["students", "admins"].includes(resource) &&
  sensitiveFields.some(field =>
    Object.prototype.hasOwnProperty.call(body, field)
  )
) {
  return res.status(400).json({
    message: "Credentials must be managed through the authentication API"
  });
}
      const id = validId(body.id)
        ? String(body.id)
        : crypto.randomUUID();

      const existing = await collection(resource)
        .findOne({ id });

      if (existing) {
        return res.status(409).json({
          message: "Record ID already exists"
        });
      }

      const saved = { ...body, id };

      await collection(resource).insertOne(saved);

      res.status(201).json(publicRecord(saved));
    } catch (error) {
      next(error);
    }
  }
);

// Replace a record, retaining its original ID.
app.put(
  "/api/:resource/:id",
  authorizeResource,
  async (req, res, next) => {
    try {
      const { resource, id } = req.params;
      const body = cleanBody(req.body);

      if (!body) {
        return res.status(400).json({
          message: "Invalid record"
        });
      }

      if (
        body.id !== undefined &&
        String(body.id) !== id
      ) {
        return res.status(400).json({
          message: "Record ID cannot be changed"
        });
      }

      const existing = await collection(resource)
        .findOne({ id });

      if (!existing) {
        return res.status(404).json({
          message: "Record not found"
        });
      }

      if (resource === "courses") {
        // Validate the final course rather than
        // accepting an incomplete replacement.
        const merged = { ...existing, ...body };
        for (const field of [
          "title",
          "instructor",
          "duration",
          "level"
        ]) {
          if (!String(merged[field] ?? "").trim()) {
            return res.status(400).json({
              message: `${field} is required`
            });
          }
        }
      }

      const replacement = { ...body, id };

      // Preserve credentials if an existing UI sends
      // a sanitized user object.
      if (
        ["students", "admins"].includes(resource) &&
        !replacement.passwordHash
      ) {
        replacement.passwordHash = existing.passwordHash;
      }

      const result = await collection(resource)
        .replaceOne({ id }, replacement);

      if (!result.matchedCount) {
        return res.status(404).json({
          message: "Record not found"
        });
      }

      res.json(publicRecord(replacement));
    } catch (error) {
      next(error);
    }
  }
);

// Partial update.
app.patch(
  "/api/:resource/:id",
  authorizeResource,
  async (req, res, next) => {
    try {
      const { resource, id } = req.params;
      const body = cleanBody(req.body);

      if (!body || Object.keys(body).length === 0) {
        return res.status(400).json({
          message: "Invalid update"
        });
      }

      if (
        body.id !== undefined &&
        String(body.id) !== id
      ) {
        return res.status(400).json({
          message: "Record ID cannot be changed"
        });
      }

      delete body.id;

      if (
        req.user?.role === "student" &&
        resource === "students"
      ) {
        if (
          Object.keys(body).length !== 1 ||
          typeof body.lastLogin !== "string"
        ) {
          return res.status(403).json({
            message: "Only lastLogin can be updated"
          });
        }
      }

      const result = await collection(resource)
        .findOneAndUpdate(
          { id },
          { $set: body },
          { returnDocument: "after" }
        );

      if (!result) {
        return res.status(404).json({
          message: "Record not found"
        });
      }

      res.json(publicRecord(result));
    } catch (error) {
      next(error);
    }
  }
);

// Delete a record without deleting its historical
// enrollment and progress references.
app.delete(
  "/api/:resource/:id",
  authorizeResource,
  async (req, res, next) => {
    try {
      const { resource, id } = req.params;

      const result = await collection(resource)
        .deleteOne({ id });

      if (!result.deletedCount) {
        return res.status(404).json({
          message: "Record not found"
        });
      }

      res.json({
        success: true,
        message: "Record deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(
        `Express API: http://localhost:${PORT}`
      );
      console.log(
        `MongoDB connected: ${mongoose.connection.name}`
      );
    });
  } catch (error) {
    console.error(
      "Backend startup failed:",
      error.message
    );
    process.exit(1);
  }
}

startServer();
