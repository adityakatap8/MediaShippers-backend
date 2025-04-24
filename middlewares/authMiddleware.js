// import jwt from "jsonwebtoken";

// async function authenticateToken(req, res, next) {
//   console.log("=== AUTH MIDDLEWARE STARTED ===");

//   // Get the token from cookies
//   const token = req.cookies.token;
//   console.log("Received Token from Cookie:", token);

//   if (!token) {
//     console.error("🚨 No token provided in cookies!");
//     return res.status(401).json({ error: "No token provided" });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) {
//       console.error("❌ Token verification failed:", err.message);
//       return res.status(403).json({ error: "Forbidden: Invalid token" });
//     }

//     console.log("✅ Token verification successful. User Data:", user);
//     req.user = user; // Attach user data to the request object
//     next(); // Continue to the next middleware/route handler
//   });
// }

// export { authenticateToken };


import jwt from "jsonwebtoken";

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log("Authorization Header:", authHeader);

  const token = authHeader && authHeader.split(' ')[1];
  console.log("Extracted token:", token);

  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("❌ Token verification failed:", err.message);
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }

    if (!decoded.userId) {
      console.error("❌ Token is missing userId");
      return res.status(400).json({ error: "Invalid token payload" });
    }

    console.log("✅ Token verified. Decoded Payload:", decoded);
    req.user = decoded; // Contains: { userId, iat, exp }
    next();
  });
}

export { authenticateToken };

