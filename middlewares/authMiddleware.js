import jwt from "jsonwebtoken";

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log("Authorization Header:", authHeader);

  const token = authHeader && authHeader.split(' ')[1];
  console.log("Extracted token:", token);

  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("❌ Token verification failed:", err.message);
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }

    console.log("✅ Token verification successful. User Data:", user);
    req.user = user; // Attach user data to the request object
    next(); // Continue to the next middleware/route handler
  });
}

export { authenticateToken };
