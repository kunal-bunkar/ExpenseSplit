const jwt = require('jsonwebtoken'); // Make sure this is required at the top

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(403).json({ message: "Access Denied. No token provided." });
  }

  // Format should be "Bearer <token>"
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(403).json({ message: "Access Denied. Invalid token format." });
  }

  const token = tokenParts[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Add the decoded payload to request
    next(); // Proceed to next middleware/route handler
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};
