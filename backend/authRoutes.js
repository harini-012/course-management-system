
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

/* ==========================================
   STUDENT PASSWORD RESET REQUESTS
   ========================================== */

const resetRequests = () =>
  dbCollection("passwordResetRequests");

function verifyAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Admin login required"
      });
    }

    const decoded = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Administrator access required"
      });
    }

    req.adminIdentity = decoded;
    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired admin session"
    });
  }
}

async function findAuthenticatedAdmin(req) {
  return dbCollection("admins").findOne({
    id: req.adminIdentity.sub,
    email: req.adminIdentity.email,
    active: { $ne: false }
  });
}

function requestObjectId(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return new mongoose.Types.ObjectId(id);
}

// STUDENT SUBMITS FORGOT PASSWORD REQUEST
router.post("/password-reset/request", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "")
      .trim().toLowerCase();

    if (!validEmail(email)) {
      return res.status(400).json({
        message: "Enter a valid email address"
      });
    }

    const student = await dbCollection("students").findOne({
      email,
      active: { $ne: false }
    });

    if (student) {
      const existing = await resetRequests().findOne({
        studentId: student.id,
        status: "pending"
      });

      if (!existing) {
        await resetRequests().insertOne({
          studentId: student.id,
          studentName: student.studentName,
          studentEmail: student.email,
          status: "pending",
          createdAt: new Date()
        });
      }
    }

    res.json({
      message:
        "If your email is registered, your password reset request has been sent to the administrator."
    });
  } catch (error) {
    next(error);
  }
});

// ADMIN VIEWS REQUESTS
router.get(
  "/admin/password-reset-requests",
  verifyAdmin,
  async (req, res, next) => {
    try {
      const admin = await findAuthenticatedAdmin(req);

      if (!admin) {
        return res.status(403).json({
          message: "Administrator not found"
        });
      }

      const requests = await resetRequests()
        .find({ status: "pending" })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

      res.json(requests.map(item => ({
        id: String(item._id),
        studentName: item.studentName,
        studentEmail: item.studentEmail,
        createdAt: item.createdAt,
        status: item.status
      })));
    } catch (error) {
      next(error);
    }
  }
);

// ADMIN APPROVES AND CHANGES PASSWORD
router.post(
  "/admin/password-reset-requests/:id/approve",
  verifyAdmin,
  async (req, res, next) => {
    try {
      const admin = await findAuthenticatedAdmin(req);

      if (!admin) {
        return res.status(403).json({
          message: "Administrator not found"
        });
      }

      const requestId = requestObjectId(req.params.id);
      const { newPassword } = req.body || {};

      if (!requestId || !validPassword(newPassword)) {
        return res.status(400).json({
          message: "Valid request and 8–72 character password required"
        });
      }

      const request = await resetRequests().findOne({
        _id: requestId,
        status: "pending"
      });

      if (!request) {
        return res.status(404).json({
          message: "Pending request not found"
        });
      }

      const student = await dbCollection("students").findOne({
        id: request.studentId,
        email: request.studentEmail,
        active: { $ne: false }
      });

      if (!student) {
        return res.status(404).json({
          message: "Student not found"
        });
      }

      const claim = await resetRequests().updateOne(
        { _id: requestId, status: "pending" },
        {
          $set: {
            status: "processing",
            processedBy: admin.id
          }
        }
      );

      if (claim.modifiedCount !== 1) {
        return res.status(409).json({
          message: "Request already being processed"
        });
      }

      try {
        const passwordHash = await bcrypt.hash(
          newPassword, 12
        );

        const updated = await dbCollection("students").updateOne(
          { _id: student._id, active: { $ne: false } },
          {
            $set: {
              passwordHash,
              mustChangePassword: true
            },
            $unset: { password: "" }
          }
        );

        if (updated.matchedCount !== 1) {
          throw new Error("Student update failed");
        }

        await resetRequests().updateOne(
          { _id: requestId },
          {
            $set: {
              status: "approved",
              processedAt: new Date()
            }
          }
        );
      } catch (error) {
        await resetRequests().updateOne(
          { _id: requestId, status: "processing" },
          { $set: { status: "pending" } }
        );
        throw error;
      }

      res.json({
        message:
          "Password reset successfully. Give the temporary password privately to the verified student."
      });
    } catch (error) {
      next(error);
    }
  }
);

// ADMIN REJECTS REQUEST
router.post(
  "/admin/password-reset-requests/:id/reject",
  verifyAdmin,
  async (req, res, next) => {
    try {
      const admin = await findAuthenticatedAdmin(req);

      if (!admin) {
        return res.status(403).json({
          message: "Administrator not found"
        });
      }

      const requestId = requestObjectId(req.params.id);

      if (!requestId) {
        return res.status(400).json({
          message: "Invalid request ID"
        });
      }

      const result = await resetRequests().updateOne(
        { _id: requestId, status: "pending" },
        {
          $set: {
            status: "rejected",
            processedBy: admin.id,
            processedAt: new Date()
          }
        }
      );

      if (!result.modifiedCount) {
        return res.status(404).json({
          message: "Pending request not found"
        });
      }

      res.json({
        message: "Request rejected"
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
