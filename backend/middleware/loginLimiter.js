const { rateLimit } = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  // High limit for college demonstration
  limit: 1000,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    message: "Service temporarily unavailable. Please try again later."
  }
});

module.exports = loginLimiter;