
import { authenticateToken } from "./authMiddleware";
const authRoutes = Router();

// Middleware to check for authenticated users
function isAuthenticated(req, res, next) {
    const token = req.headers['authorization'];
    
    if (!token) {
      return res.status(401).json({ success: false, errorMessage: 'No token provided' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ success: false, errorMessage: 'Invalid token' });
      }
      
      req.user = decoded;
      next();
    });
  }