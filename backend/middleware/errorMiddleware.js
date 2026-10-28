const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message);

  const statusCode =
    err.status || err.statusCode ||
    (res.statusCode >= 400 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production" && statusCode >= 500
        ? "Internal Server Error"
        : err.message || "Internal Server Error"
  });
};

module.exports = errorHandler;