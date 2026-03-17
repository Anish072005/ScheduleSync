const { verifyToken } = require("../utils/jwt.util");
const User = require("../models/user.model");

async function isUserAuthenticated(req, res, next) {
  console.log(req.headers);
  const authorization = req.headers['authorization'];
  console.log(authorization);
  const token = authorization && authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = await verifyToken(token);

    const user = await User.findById(decoded.id).select("_id name email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
async function isAdminAuthenticated(req, res, next) {
  const authorization = req.headers['authorization'];
  const token = authorization && authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = await verifyToken(token);

    const user = await User.findById(decoded.id).select("_id name email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Extra check — only admins can pass
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: Admin access only" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = {
  isUserAuthenticated,
  isAdminAuthenticated, // ✅ now exported
};