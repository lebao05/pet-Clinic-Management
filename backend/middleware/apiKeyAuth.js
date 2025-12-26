module.exports = function apiKeyAuth(req, res, next) {
  const expected = process.env.API_KEY;
  const provided = req.header("apiKey");

  if (!expected) {
    return res.status(500).json({
      success: false,
      error: "Server misconfigured",
      message: "Missing API_KEY in environment",
    });
  }

  if (!provided || provided !== expected) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Invalid or missing apiKey header",
    });
  }

  next();
};
