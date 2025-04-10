import jwt from "jsonwebtoken";

async function authenticateToken(req, res, next) {
  console.log("=== AUTH MIDDLEWARE STARTED ===");

  // Get the token from cookies
  const token = req.cookies.token;
  console.log("Received Token from Cookie:", token);

  if (!token) {
    console.error("🚨 No token provided in cookies!");
    return res.status(401).json({ error: "No token provided" });
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
