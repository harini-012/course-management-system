
const express = require("express");
const router = express.Router();

const {
  authenticateToken
} = require("../middleware/authMiddleware");

const {
  getMyProgress,
  updateProgress
} = require("../controllers/learningProgressController");

// Get student's learning progress
router.get(
  "/my-progress",
  authenticateToken,
  getMyProgress
);

// Update learning progress
router.put(
  "/",
  authenticateToken,
  updateProgress
);

module.exports = router;
