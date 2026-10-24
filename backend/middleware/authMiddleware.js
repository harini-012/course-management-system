const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token is required"
    });
  }

  const token = header.slice(7).trim();

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT configuration is missing"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      message: "Administrator access required"
    });
  }

  next();
}

module.exports = {
  authenticateToken,
  requireAdmin
};