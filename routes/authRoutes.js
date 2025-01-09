import express from 'express';
import { Router } from 'express';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import { sessionStorage } from '../controller/sessionStorage.js';
import mongoose from 'mongoose';
const authRoutes = Router();


async function hashPassword(password) {
    const saltRounds = 10;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password', error);
        throw error;
    }
}

function generateJWT(userId) {
    const secretKey = process.env.JWT_SECRET;
    console.log('Generating JWT with secret:', secretKey);
    const token = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
    return token;
}

async function validatePassword(password, hashedPassword) {
    try {
        const isValid = await bcrypt.compare(password, hashedPassword);
        return isValid;
    } catch (error) {
        console.error('Error validating password:', error);
        throw error;
    }
}

async function authenticationToken(req, res, next) {
  console.log('Authentication middleware called');
  
  // Get the Authorization header from the request
  const authHeader = req.headers['authorization'];

  // Check if Authorization header is present
  if (!authHeader) {
      console.error('Authorization header missing');
      return res.status(401).json({ message: 'Authorization header missing' });
  }

  // Extract the token from the header (Bearer <token>)
  const token = authHeader.split(' ')[1];

  if (!token) {
      console.error('Token missing in Authorization header');
      return res.status(401).json({ message: 'Token missing' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
          console.error('Token verification failed:', err.message);
          return res.status(403).json({ message: 'Invalid token' });
      }

      // Attach the user data to the request object
      req.user = user;
      next();  // Pass control to the next middleware or route handler
  });
}
// Auth routes
authRoutes.post('/register', async (req, res) => {
    console.log('Received register request:', req.body);
    try {
        const { name, orgName, email, password } = req.body;

        // Validate input
        if (!name || !orgName || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                errorMessage: 'Missing required fields' 
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                errorMessage: 'Email already registered. Please choose a different email address.',
                errorDetails: 'Duplicate email found'
            });
        }

        // Create user
        const user = new User({ name, orgName, email, passwordHash: hashedPassword });
        await user.save();

        // Generate unique ID for the user
        const userId = crypto.randomUUID();
        await User.findByIdAndUpdate(user._id, { $set: { userId } }, { new: true });

        // Generate JWT token
        const token = generateJWT(userId);

        res.json({
            success: true,
            message: 'User registered successfully',
            userId: userId,
            token: token
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({
            success: false,
            errorMessage: 'Registration failed',
            errorDetails: error.message
        });
    }
});

authRoutes.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        errorMessage: 'User not found',
        errorDetails: 'No account associated with this email'
      });
    }

    // Validate password
    const isValidPassword = await validatePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        errorMessage: 'Invalid credentials',
        errorDetails: 'Incorrect email or password'
      });
    }

    // Generate JWT token
    const token = generateJWT(user.userId);

    // Return token and user details to frontend
    res.json({ 
      success: true, 
      message: 'Login successful',
      userId: user.userId,
      token: token
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      success: false,
      errorMessage: 'Login failed',
      errorDetails: error.message
    });
  }
});




authRoutes.post('/logout', async (req, res) => {
    // Clear session_token cookie
    res.clearCookie('session_token');
    
    // Remove user data from sessionStorage
    sessionStorage.removeItem('userData');
    
    res.json({ success: true, message: 'Logged out successfully' });
});


authRoutes.get('/user', authenticationToken, async (req, res) => {
    try {
      console.log('Received request');
      const userId = req.user.userId;
      
      // Function to validate and convert userId
      const validateUserId = (value) => {
        if (typeof value !== 'string' && typeof value !== 'number') {
          throw new Error('Invalid userId format');
        }
        return value;
      };
  
      let validatedUserId;
      try {
        validatedUserId = validateUserId(userId);
        console.log('Validated User ID:', validatedUserId);
      } catch (error) {
        console.error('Error validating userId:', error.message);
        return res.status(400).json({
          success: false,
          errorMessage: 'Invalid userId format',
          errorDetails: 'UserId must be a valid string or number'
        });
      }
  
      const user = await User.findOne({ $or: [{ _id: validatedUserId }, { userId: validatedUserId }] });
      
      if (!user) {
        console.error('User not found');
        return res.status(404).json({ 
          success: false,
          errorMessage: 'User not found',
          errorDetails: 'No user associated with this token'
        });
      }
      console.log('Found User:', JSON.stringify(user));

      const userDetails = {
        userId: user.userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar || null
      };
  
      console.log('Sending user details:', JSON.stringify(userDetails));
    
      res.json(userDetails);
  
    } catch (error) {
      console.error('Error fetching user details:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        errorMessage: 'Failed to fetch user details',
        errorDetails: error.message
      });
    }
});

authRoutes.post('/store-token', authenticationToken, async (req, res) => {
  const { userId, name, email } = req.user;

  try {
      // Return the token and user data to the frontend
      res.json({
          success: true,
          message: 'Token and user data received successfully',
          token: req.headers.authorization.split(' ')[1], // Include token in the response
          userData: { userId, name, email } // Include user data in the response
      });
  } catch (error) {
      console.error('Error storing token:', error);
      res.status(500).json({ success: false, errorMessage: 'Failed to store token' });
  }
});


export { authRoutes };
