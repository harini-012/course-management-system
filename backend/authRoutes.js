
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
const loginLimiter = require("./middleware/loginLimiter");
const router = express.Router();

function dbCollection(name) {
  return mongoose.connection.db.collection(name);
}

function safeUser(user) {
  const {
    _id,
    password,
    passwordHash,
    ...safe
  } = user;

  return safe;
}

function generateToken(user, role) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.sign(
    {
      email: user.email,
      role
    },
    process.env.JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn: process.env.JWT_EXPIRES_IN || "1h"
    }
  );
}

function validEmail(email) {
  return (
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
}

function validPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 72
  );
}

async function accountExists(resource, email, idField, id) {
  const users = await dbCollection(resource)
    .find(
      {},
      {
        projection: {
          email: 1,
          [idField]: 1
        }
      }
    )
    .toArray();

  return users.some(user =>
    String(user.email || "").toLowerCase() === email ||
    String(user[idField] || "") === id
  );
}

// STUDENT REGISTRATION
router.post("/register", async (req, res, next) => {
  try {
    const {
      studentName,
      studentId,
      email,
      department,
      password
    } = req.body || {};

    if (
      [studentName, studentId, email, department]
        .some(value =>
          typeof value !== "string" || !value.trim()
        ) ||
      !validEmail(email) ||
      !validPassword(password)
    ) {
      return res.status(400).json({
        message:
          "Enter all fields, a valid email and an 8–72 character password"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedId = studentId.trim();

    if (
      await accountExists(
        "students",
        normalizedEmail,
        "studentId",
        normalizedId
      )
    ) {
      return res.status(409).json({
        message: "Student email or ID already registered"
      });
    }

    const student = {
      id: crypto.randomUUID(),
      studentName: studentName.trim(),
      studentId: normalizedId,
      email: normalizedEmail,
      department: department.trim(),
      passwordHash: await bcrypt.hash(password, 12),
      role: "Student",
      enrolledCourses: [],
      completedCourses: [],
      certificates: [],
      progress: {},
      registrationDate: new Date().toLocaleDateString(),
      lastLogin: "",
      active: true
    };

    await dbCollection("students").insertOne(student);

    res.status(201).json({
      message: "Student registered successfully",
      student: safeUser(student)
    });
  } catch (error) {
    next(error);
  }
});

// STUDENT AND ADMIN LOGIN
router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const {
      email,
      password,
      role = "student"
    } = req.body || {};

    if (
      !validEmail(email) ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Valid email and password are required"
      });
    }

    const normalizedRole =
      role === "admin" ? "admin" : "student";

    const resource =
      normalizedRole === "admin"
        ? "admins"
        : "students";

    const normalizedEmail = email.trim().toLowerCase();

    const user = await dbCollection(resource).findOne({
      email: normalizedEmail
    });

    if (
      !user ||
      user.active === false ||
      !user.passwordHash
    ) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!valid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    res.json({
      message: "Login successful",
      token: generateToken(user, normalizedRole),
      tokenType: "Bearer",
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      user: safeUser(user)
    });
  } catch (error) {
    next(error);
  }
});

// ADMIN REGISTRATION
// Restrict this route before production deployment.
router.post("/admin/register", async (req, res, next) => {
  try {
    if (
      process.env.NODE_ENV === "production" ||
      ![
        "127.0.0.1",
        "::1",
        "::ffff:127.0.0.1"
      ].includes(req.socket.remoteAddress)
    ) {
      return res.status(403).json({
        message: "Admin registration is local-only"
      });
    }

    const {
      adminName,
      adminId,
      email,
      designation,
      password
    } = req.body || {};

    if (
      [adminName, adminId, email, designation]
        .some(value =>
          typeof value !== "string" || !value.trim()
        ) ||
      !validEmail(email) ||
      !validPassword(password)
    ) {
      return res.status(400).json({
        message:
          "Enter all fields, a valid email and an 8–72 character password"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedId = adminId.trim();

    if (
      await accountExists(
        "admins",
        normalizedEmail,
        "adminId",
        normalizedId
      )
    ) {
      return res.status(409).json({
        message: "Admin email or ID already registered"
      });
    }

    const admin = {
      id: crypto.randomUUID(),
      adminName: adminName.trim(),
      adminId: normalizedId,
      email: normalizedEmail,
      designation: designation.trim(),
      passwordHash: await bcrypt.hash(password, 12),
      role: "Administrator",
      createdCourses: [],
      managedStudents: [],
      registrationDate: new Date().toLocaleDateString(),
      lastLogin: "",
      active: true
    };

    await dbCollection("admins").insertOne(admin);

    res.status(201).json({
      message: "Administrator registered successfully",
      admin: safeUser(admin)
    });
  } catch (error) {
    next(error);
  }
});

/* =====================================================
   LOCAL DEMO ONLY - FORGOT / RESET PASSWORD
   No SMTP or OTP required.
   Never enable on a public server.
   ===================================================== */

function allowLocalDemo(req, res, next) {
  const localAddresses = [
    "127.0.0.1",
    "::1",
    "::ffff:127.0.0.1"
  ];

  if (
    process.env.NODE_ENV === "production" ||
    process.env.LOCAL_DEMO_PASSWORD_RESET !== "true" ||
    !localAddresses.includes(req.socket.remoteAddress)
  ) {
    return res.status(403).json({
      message: "Local demo password reset is disabled"
    });
  }

  next();
}

function getResetCollection(role) {
  if (role === "student") return "students";
  if (role === "admin") return "admins";
  return null;
}

function normalizeResetEmail(email) {
  return String(email || "").trim().toLowerCase();
}

// STEP 1 - CHECK REGISTERED EMAIL
router.post(
  "/dev/check-email",
  allowLocalDemo,
  async (req, res, next) => {
    try {
      const email = normalizeResetEmail(req.body?.email);
      const role = String(req.body?.role || "")
        .trim()
        .toLowerCase();

      const resource = getResetCollection(role);

      if (!validEmail(email) || !resource) {
        return res.status(400).json({
          message: "Valid email and role are required"
        });
      }

      const user = await dbCollection(resource).findOne({
        email,
        active: { $ne: false }
      });

      if (!user) {
        return res.status(404).json({
          message: "No registered account found"
        });
      }

      return res.json({
        message: "Registered email verified",
        registered: true
      });
    } catch (error) {
      next(error);
    }
  }
);

// STEP 2 - RESET PASSWORD
router.post(
  "/dev/reset-password",
  allowLocalDemo,
  async (req, res, next) => {
    try {
      const email = normalizeResetEmail(req.body?.email);
      const role = String(req.body?.role || "")
        .trim()
        .toLowerCase();

      const { newPassword } = req.body || {};

      const resource = getResetCollection(role);

      if (
        !validEmail(email) ||
        !resource ||
        !validPassword(newPassword)
      ) {
        return res.status(400).json({
          message:
            "Valid email, role, and 8–72 character password required"
        });
      }

      const passwordHash = await bcrypt.hash(
        newPassword,
        12
      );

      const result = await dbCollection(resource).updateOne(
        {
          email,
          active: { $ne: false }
        },
        {
          $set: { passwordHash },
          $unset: { password: "" }
        }
      );

      if (result.matchedCount !== 1) {
        return res.status(404).json({
          message: "Registered account not found"
        });
      }

      return res.json({
        message: "Password reset successfully"
      });
    } catch (error) {
      next(error);
    }
  }
);
// ADMIN RESET STUDENT PASSWORD
router.post("/admin/reset-student-password", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Admin login required"
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        authHeader.slice(7).trim(),
        process.env.JWT_SECRET
      );
    } catch {
      return res.status(401).json({
        message: "Invalid or expired login"
      });
    }

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can reset student passwords"
      });
    }

    const admin = await dbCollection("admins").findOne({
      id: decoded.sub,
      email: decoded.email,
      active: { $ne: false }
    });

    if (!admin) {
      return res.status(403).json({
        message: "Administrator not found"
      });
    }

    const { studentEmail, newPassword } = req.body || {};

    if (!validEmail(studentEmail) || !validPassword(newPassword)) {
      return res.status(400).json({
        message: "Enter a valid student email and password (8–72 characters)"
      });
    }

    const result = await dbCollection("students").updateOne(
      {
        email: studentEmail.trim().toLowerCase(),
        active: { $ne: false }
      },
      {
        $set: {
          passwordHash: await bcrypt.hash(newPassword, 12)
        },
        $unset: {
          password: ""
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Student email not found"
      });
    }

    return res.json({
      message: "Student password reset successfully"
    });

  } catch (error) {
    next(error);
  }
});
module.exports = router;
