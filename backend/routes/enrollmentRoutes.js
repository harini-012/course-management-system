
const express = require("express");
const router = express.Router();

const {
  authenticateToken
} = require("../middleware/authMiddleware");

const {
  enrollCourse,
  getMyCourses,
  unenrollCourse
} = require("../controllers/enrollmentController");

// Enroll student in a course
router.post(
  "/",
  authenticateToken,
  enrollCourse
);

// Get logged-in student's courses
router.get(
  "/my-courses",
  authenticateToken,
  getMyCourses
);

// Unenroll from a course
router.delete(
  "/:courseId",
  authenticateToken,
  unenrollCourse
);

module.exports = router;
