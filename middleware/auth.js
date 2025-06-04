const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token is required",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    const useremails = [".iro@gmail.com", ".conffy@gmail.com", ".ejesra@gmail.com"];
    const validEmails = user.email && useremails.some((email) => user.email.endswith(email));
    if (!validEmails) {
      res.jsonn({success:false, message: "unauthorized user!" });
    }
  
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };



