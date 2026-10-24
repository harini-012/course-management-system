const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const DB = "http://localhost:5000";

async function readUsers(resource) {
  const response = await fetch(`${DB}/${resource}`);

  if (!response.ok) {
    throw new Error("Unable to access database");
  }

  return response.json();
}

function safeUser(user) {
  const { password, passwordHash, ...data } = user;
  return data;
}

function generateToken(user, role) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.sign(
    { email: user.email, role },
    process.env.JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn: process.env.JWT_EXPIRES_IN || "1h"
    }
  );
}

// TASK 9 — STUDENT REGISTRATION
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
      [studentName, studentId, email, department, password]
        .some(value => typeof value !== "string" || !value.trim())
    ) {
      return res.status(400).json({
        message: "All registration fields are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email address"
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        message: "Password must be 8 to 72 characters"
      });
    }

    const students = await readUsers("students");

    if (students.some(s =>
      String(s.email).toLowerCase() === normalizedEmail
    )) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    if (students.some(s =>
      String(s.studentId) === studentId.trim()
    )) {
      return res.status(409).json({
        message: "Student ID already registered"
      });
    }

    const student = {
      studentName: studentName.trim(),
      studentId: studentId.trim(),
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

    const response = await fetch(`${DB}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    });

    if (!response.ok) {
      throw new Error("Unable to save student");
    }

    const saved = await response.json();

    return res.status(201).json({
      message: "Student registered successfully",
      student: safeUser(saved)
    });

  } catch (error) {
    next(error);
  }
});

// TASK 9 AND 10 — LOGIN
router.post("/login", async (req, res, next) => {
  try {
    const { email, password, role = "student" } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedRole = role === "admin" ? "admin" : "student";
    const resource = normalizedRole === "admin" ? "admins" : "students";

    const users = await readUsers(resource);

    const user = users.find(u =>
      String(u.email).toLowerCase() === email.trim().toLowerCase()
    );

    if (!user || user.active === false || !user.passwordHash) {
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

    return res.status(200).json({
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
// ADMIN REGISTRATION — CLASSROOM DEMO
router.post("/admin/register", async (req, res, next) => {
  try {
    const {
      adminName,
      adminId,
      email,
      designation,
      password
    } = req.body || {};

    if (
      [adminName, adminId, email, designation, password]
        .some(v => typeof v !== "string" || !v.trim())
    ) {
      return res.status(400).json({
        message: "All admin fields are required"
      });
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: "Enter a valid email and 8–72 character password"
      });
    }

    const admins = await readUsers("admins");

    if (admins.some(a =>
      String(a.email).toLowerCase() === email.trim().toLowerCase() ||
      String(a.adminId) === adminId.trim()
    )) {
      return res.status(409).json({
        message: "Admin email or ID already registered"
      });
    }

    const admin = {
      adminName: adminName.trim(),
      adminId: adminId.trim(),
      email: email.trim().toLowerCase(),
      designation: designation.trim(),
      passwordHash: await bcrypt.hash(password, 12),
      role: "Administrator",
      createdCourses: [],
      managedStudents: [],
      registrationDate: new Date().toLocaleDateString(),
      lastLogin: "",
      active: true
    };

    const response = await fetch(`${DB}/admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(admin)
    });

    if (!response.ok) {
      throw new Error("Unable to register admin");
    }

    const saved = await response.json();

    return res.status(201).json({
      message: "Administrator registered successfully",
      admin: safeUser(saved)
    });

  } catch (error) {
    next(error);
  }
});
module.exports = router;