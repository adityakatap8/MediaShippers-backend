
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const fetchCurrentUserInfo = async (req, res) => {
    
    try {
      let token = req.cookies.token;
  
      if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }
  
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ userId: decoded.userId }).select('-passwordHash');
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error('Error fetching current user info:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
