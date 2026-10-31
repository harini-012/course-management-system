
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




/* =====================================================
   STUDENT + ADMIN PASSWORD RESET REQUESTS
   DEMONSTRATION WORKFLOW
   ===================================================== */

const resetRequests = () =>
  dbCollection("passwordResetRequests");

const resetStatusLimiter = loginLimiter;

function getPasswordResetRole(body) {
  return body?.role === "admin" ? "admin" : "student";
}

function getPasswordResetCollection(role) {
  return role === "admin" ? "admins" : "students";
}

function getPasswordResetEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function hashTrackingCode(code) {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
}

function validTrackingCode(code) {
  return /^[a-f0-9]{48}$/.test(code);
}

function getRequestRole(request) {
  return request.role === "admin" ? "admin" : "student";
}

function getRequestAccountId(request) {
  return request.accountId || request.studentId;
}

function getRequestAccountEmail(request) {
  return request.accountEmail || request.studentEmail;
}

function getRequestAccountName(request) {
  return request.accountName || request.studentName;
}

// Authenticate the administrator making an approval decision.
function verifyAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Administrator login required"
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
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired administrator session"
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
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  return new mongoose.Types.ObjectId(id);
}

/* =====================================================
   STEP 1 - STUDENT OR ADMIN SUBMITS REQUEST
   ===================================================== */

router.post(
  "/password-reset/request",
  resetStatusLimiter,
  async (req, res, next) => {
    try {
      const email = getPasswordResetEmail(
        req.body?.email
      );

      const role = getPasswordResetRole(req.body);

      if (!validEmail(email)) {
        return res.status(400).json({
          message: "Enter a valid email address"
        });
      }

      const trackingCode = crypto
        .randomBytes(24)
        .toString("hex");

      const trackingHash =
        hashTrackingCode(trackingCode);

      const collectionName =
        getPasswordResetCollection(role);

      const account = await dbCollection(
        collectionName
      ).findOne({
        email,
        active: { $ne: false }
      });

      if (account) {
        const existing = await resetRequests().findOne({
          status: "pending",
          $or: [
            {
              role,
              accountId: account.id
            },
            ...(role === "student"
              ? [
                  {
                    studentId: account.id,
                    role: { $exists: false }
                  }
                ]
              : [])
          ]
        });

        const requestDetails = {
          role,
          accountId: account.id,
          accountName:
            role === "admin"
              ? account.adminName
              : account.studentName,
          accountEmail: account.email,
          trackingHash,
          createdAt: new Date()
        };

        if (existing) {
          await resetRequests().updateOne(
            {
              _id: existing._id,
              status: "pending"
            },
            {
              $set: requestDetails
            }
          );
        } else {
          await resetRequests().insertOne({
            ...requestDetails,
            status: "pending"
          });
        }
      }

      return res.json({
        message:
          "If this email is registered, your password reset request has been submitted. Save your tracking code.",
        trackingCode
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =====================================================
   STEP 2 - CHECK PASSWORD RESET STATUS
   ===================================================== */

router.post(
  "/password-reset/status",
  resetStatusLimiter,
  async (req, res, next) => {
    try {
      const email = getPasswordResetEmail(
        req.body?.email
      );

      const role = getPasswordResetRole(req.body);

      const trackingCode = String(
        req.body?.trackingCode || ""
      ).trim();

      if (
        !validEmail(email) ||
        !validTrackingCode(trackingCode)
      ) {
        return res.status(400).json({
          message:
            "Enter a valid email and tracking code"
        });
      }

      const request = await resetRequests().findOne({
        trackingHash: hashTrackingCode(trackingCode),
        $or: [
          {
            role,
            accountEmail: email
          },
          ...(role === "student"
            ? [
                {
                  role: { $exists: false },
                  studentEmail: email
                }
              ]
            : [])
        ]
      });

      if (!request) {
        return res.status(404).json({
          message:
            "No request found. Check your email and tracking code."
        });
      }

      const messages = {
        pending:
          "Your request is waiting for administrator approval.",
        approved:
          "Your request is approved. You can now create a new password.",
        rejected:
          "Your request was rejected. Contact an administrator.",
        completing:
          "Your password reset is being processed.",
        completed:
          "Your password has been changed successfully."
      };

      return res.json({
        status: request.status,
        message:
          messages[request.status] ||
          "Please contact an administrator."
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =====================================================
   STEP 3 - ADMIN VIEWS ALL PENDING REQUESTS
   ===================================================== */

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

      return res.json(
        requests.map(request => ({
          id: String(request._id),
          role: getRequestRole(request),
          accountName: getRequestAccountName(request),
          accountEmail: getRequestAccountEmail(request),
          studentName: request.studentName,
          studentEmail: request.studentEmail,
          createdAt: request.createdAt,
          status: request.status,
          isOwnRequest:
            getRequestRole(request) === "admin" &&
            getRequestAccountId(request) === admin.id
        }))
      );
    } catch (error) {
      next(error);
    }
  }
);

/* =====================================================
   STEP 4 - ADMIN APPROVES PASSWORD RESET
   ===================================================== */

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

      const requestId = requestObjectId(
        req.params.id
      );

      if (!requestId) {
        return res.status(400).json({
          message: "Invalid request ID"
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

      const role = getRequestRole(request);

      // An administrator cannot approve their own reset.
      if (
        role === "admin" &&
        getRequestAccountId(request) === admin.id
      ) {
        return res.status(403).json({
          message:
            "You cannot approve your own password reset request"
        });
      }

      const account = await dbCollection(
        getPasswordResetCollection(role)
      ).findOne({
        id: getRequestAccountId(request),
        email: getRequestAccountEmail(request),
        active: { $ne: false }
      });

      if (!account || !request.trackingHash) {
        return res.status(400).json({
          message:
            "Account or tracking code unavailable. Submit a new request."
        });
      }

      const result = await resetRequests().updateOne(
        {
          _id: requestId,
          status: "pending"
        },
        {
          $set: {
            status: "approved",
            processedAt: new Date(),
            processedBy: admin.id
          }
        }
      );

      if (result.modifiedCount !== 1) {
        return res.status(409).json({
          message: "Request already processed"
        });
      }

      return res.json({
        message:
          "Request approved. The account holder can now create a new password."
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =====================================================
   STEP 5 - ADMIN REJECTS PASSWORD RESET
   ===================================================== */

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

      const requestId = requestObjectId(
        req.params.id
      );

      if (!requestId) {
        return res.status(400).json({
          message: "Invalid request ID"
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

      if (
        getRequestRole(request) === "admin" &&
        getRequestAccountId(request) === admin.id
      ) {
        return res.status(403).json({
          message:
            "You cannot process your own password reset request"
        });
      }

      const result = await resetRequests().updateOne(
        {
          _id: requestId,
          status: "pending"
        },
        {
          $set: {
            status: "rejected",
            processedAt: new Date(),
            processedBy: admin.id
          }
        }
      );

      if (result.modifiedCount !== 1) {
        return res.status(409).json({
          message: "Request already processed"
        });
      }

      return res.json({
        message:
          "Password reset request rejected successfully."
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =====================================================
   STEP 6 - STUDENT OR ADMIN SETS NEW PASSWORD
   ===================================================== */

router.post(
  "/password-reset/complete",
  resetStatusLimiter,
  async (req, res, next) => {
    try {
      const email = getPasswordResetEmail(
        req.body?.email
      );

      const role = getPasswordResetRole(req.body);

      const trackingCode = String(
        req.body?.trackingCode || ""
      ).trim();

      const { newPassword } = req.body || {};

      if (
        !validEmail(email) ||
        !validTrackingCode(trackingCode) ||
        !validPassword(newPassword)
      ) {
        return res.status(400).json({
          message:
            "Valid email, tracking code and 8–72 character password required"
        });
      }

      const trackingHash =
        hashTrackingCode(trackingCode);

      const request = await resetRequests().findOne({
        trackingHash,
        status: "approved",
        $or: [
          {
            role,
            accountEmail: email
          },
          ...(role === "student"
            ? [
                {
                  role: { $exists: false },
                  studentEmail: email
                }
              ]
            : [])
        ]
      });

      if (!request) {
        return res.status(400).json({
          message:
            "Approved request not found. Check your email and tracking code."
        });
      }

      const collection = dbCollection(
        getPasswordResetCollection(role)
      );

      const account = await collection.findOne({
        id: getRequestAccountId(request),
        email,
        active: { $ne: false }
      });

      if (!account) {
        return res.status(400).json({
          message: "Account not found"
        });
      }

      const passwordHash = await bcrypt.hash(
        newPassword,
        12
      );

      // Claim the request so it cannot be used twice.
      const claim = await resetRequests().updateOne(
        {
          _id: request._id,
          status: "approved",
          trackingHash
        },
        {
          $set: {
            status: "completing"
          }
        }
      );

      if (claim.modifiedCount !== 1) {
        return res.status(409).json({
          message:
            "This request is already being processed"
        });
      }

      try {
        const updated = await collection.updateOne(
          {
            _id: account._id,
            active: { $ne: false }
          },
          {
            $set: {
              passwordHash,
              mustChangePassword: false
            },
            $unset: {
              password: ""
            }
          }
        );

        if (updated.matchedCount !== 1) {
          throw new Error("Account update failed");
        }

        await resetRequests().updateOne(
          {
            _id: request._id,
            status: "completing"
          },
          {
            $set: {
              status: "completed",
              completedAt: new Date()
            },
            $unset: {
              trackingHash: ""
            }
          }
        );
      } catch (error) {
        await resetRequests().updateOne(
          {
            _id: request._id,
            status: "completing"
          },
          {
            $set: {
              status: "approved"
            }
          }
        );

        throw error;
      }

      return res.json({
        message:
          "Password changed successfully. You can now log in."
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =====================================================
   EXISTING ADMIN CREATES ANOTHER ADMIN
   ===================================================== */

router.post(
  "/admin/create",
  verifyAdmin,
  async (req, res, next) => {
    try {
      const currentAdmin =
        await findAuthenticatedAdmin(req);

      if (!currentAdmin) {
        return res.status(403).json({
          message: "Administrator access required"
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
          .some(
            value =>
              typeof value !== "string" ||
              !value.trim()
          ) ||
        !validEmail(email) ||
        !validPassword(password)
      ) {
        return res.status(400).json({
          message:
            "Enter all fields, a valid email and an 8–72 character password"
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      const normalizedId = adminId.trim();

      const existing = await dbCollection("admins")
        .findOne({
          $or: [
            { email: normalizedEmail },
            { adminId: normalizedId }
          ]
        });

      if (existing) {
        return res.status(409).json({
          message:
            "Administrator email or ID already exists"
        });
      }

      const admin = {
        id: crypto.randomUUID(),
        adminName: adminName.trim(),
        adminId: normalizedId,
        email: normalizedEmail,
        designation: designation.trim(),
        passwordHash: await bcrypt.hash(
          password,
          12
        ),
        role: "Administrator",
        createdCourses: [],
        managedStudents: [],
        registrationDate:
          new Date().toLocaleDateString(),
        lastLogin: "",
        active: true,
        createdBy: currentAdmin.id,
        createdAt: new Date()
      };

      await dbCollection("admins").insertOne(admin);

      return res.status(201).json({
        message:
          "New administrator created successfully",
        admin: safeUser(admin)
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
