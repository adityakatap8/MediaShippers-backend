// import express from 'express';
// import { Router } from 'express';
// import { User } from '../models/User.js';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import crypto from "crypto";
// import { sessionStorage } from '../controller/sessionStorage.js';
// import mongoose from 'mongoose';
// const authRoutes = Router();


// async function hashPassword(password) {
//     const saltRounds = 10;
//     try {
//         const hashedPassword = await bcrypt.hash(password, saltRounds);
//         return hashedPassword;
//     } catch (error) {
//         console.error('Error hashing password', error);
//         throw error;
//     }
// }

// function generateJWT(userId) {
//     const secretKey = process.env.JWT_SECRET;
//     console.log('Generating JWT with secret:', secretKey);
//     const token = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
//     return token;
// }

// async function validatePassword(password, hashedPassword) {
//     try {
//         const isValid = await bcrypt.compare(password, hashedPassword);
//         return isValid;
//     } catch (error) {
//         console.error('Error validating password:', error);
//         throw error;
//     }
// }

// async function authenticationToken(req, res, next) {
//   console.log('Authentication middleware called');
//   // Get the Authorization header from the request
//   const authHeader = req.headers['authorization'];

//   // Check if Authorization header is present
//   if (!authHeader) {
//       console.error('Authorization header missing');
//       return res.status(401).json({ message: 'Authorization header missing' });
//   }

//   // Extract the token from the header (Bearer <token>)
//   const token = authHeader.split(' ')[1];

//   if (!token) {
//       console.error('Token missing in Authorization header');
//       return res.status(401).json({ message: 'Token missing' });
//   }

//   // Verify the token
//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//       if (err) {
//           console.error('Token verification failed:', err.message);
//           return res.status(403).json({ message: 'Invalid token' });
//       }

//       // Attach the user data to the request object
//       req.user = user;
//       next();  // Pass control to the next middleware or route handler
//   });
// }
// // Auth routes
// authRoutes.post('/register', async (req, res) => {
//     console.log('Received register request:', req.body);
//     try {
//         const { name, orgName, email, password } = req.body;

//         // Validate input
//         if (!name || !orgName || !email || !password) {
//             return res.status(400).json({ 
//                 success: false, 
//                 errorMessage: 'Missing required fields' 
//             });
//         }

//         // Hash password
//         const hashedPassword = await hashPassword(password);

//         // Check if email already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(409).json({
//                 success: false,
//                 errorMessage: 'Email already registered. Please choose a different email address.',
//                 errorDetails: 'Duplicate email found'
//             });
//         }

//         // Create user
//         const user = new User({ name, orgName, email, passwordHash: hashedPassword });
//         await user.save();

//         // Generate unique ID for the user
//         const userId = crypto.randomUUID();
//         await User.findByIdAndUpdate(user._id, { $set: { userId } }, { new: true });

//         // Generate JWT token
//         const token = generateJWT(userId);

//         res.json({
//             success: true,
//             message: 'User registered successfully',
//             userId: userId,
//             token: token
//         });
//     } catch (error) {
//         console.error('Error during registration:', error);
//         res.status(500).json({
//             success: false,
//             errorMessage: 'Registration failed',
//             errorDetails: error.message
//         });
//     }
// });

// authRoutes.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Find the user
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ 
//         success: false,
//         errorMessage: 'User not found',
//         errorDetails: 'No account associated with this email'
//       });
//     }

//     // Validate password
//     const isValidPassword = await validatePassword(password, user.passwordHash);
//     if (!isValidPassword) {
//       return res.status(401).json({ 
//         success: false,
//         errorMessage: 'Invalid credentials',
//         errorDetails: 'Incorrect email or password'
//       });
//     }

//     // Generate JWT token
//     const token = generateJWT(user.userId);

//     // Return token and user details to frontend
//     res.json({ 
//       success: true, 
//       message: 'Login successful',
//       userId: user.userId,
//       token: token
//     });
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).json({
//       success: false,
//       errorMessage: 'Login failed',
//       errorDetails: error.message
//     });
//   }
// });




// authRoutes.post('/logout', async (req, res) => {
//     // Clear session_token cookie
//     res.clearCookie('session_token');

//     // Remove user data from sessionStorage
//     sessionStorage.removeItem('userData');

//     res.json({ success: true, message: 'Logged out successfully' });
// });


// authRoutes.get('/user', authenticationToken, async (req, res) => {
//     try {
//       console.log('Received request');
//       const userId = req.user.userId;
//       // Function to validate and convert userId
//       const validateUserId = (value) => {
//         if (typeof value !== 'string' && typeof value !== 'number') {
//           throw new Error('Invalid userId format');
//         }
//         return value;
//       };
//       let validatedUserId;
//       try {
//         validatedUserId = validateUserId(userId);
//         console.log('Validated User ID:', validatedUserId);
//       } catch (error) {
//         console.error('Error validating userId:', error.message);
//         return res.status(400).json({
//           success: false,
//           errorMessage: 'Invalid userId format',
//           errorDetails: 'UserId must be a valid string or number'
//         });
//       }

//       const user = await User.findOne({ $or: [{ _id: validatedUserId }, { userId: validatedUserId }] });

//       if (!user) {
//         console.error('User not found');
//         return res.status(404).json({ 
//           success: false,
//           errorMessage: 'User not found',
//           errorDetails: 'No user associated with this token'
//         });
//       }
//       console.log('Found User:', JSON.stringify(user));

//       const userDetails = {
//         userId: user.userId,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar || null,
//         userId: user.userId,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar || null,
//         orgName: user.orgName,  
//       };

//       console.log('Sending user details:', JSON.stringify(userDetails));

//       res.json(userDetails);

//     } catch (error) {
//       console.error('Error fetching user details:', error.message);
//       console.error('Error stack:', error.stack);
//       res.status(500).json({
//         success: false,
//         errorMessage: 'Failed to fetch user details',
//         errorDetails: error.message
//       });
//     }
// });

// authRoutes.post('/store-token', authenticationToken, async (req, res) => {
//   const { userId, name, email } = req.user;

//   try {
//       // Return the token and user data to the frontend
//       res.json({
//           success: true,
//           message: 'Token and user data received successfully',
//           token: req.headers.authorization.split(' ')[1], // Include token in the response
//           userData: { userId, name, email } // Include user data in the response
//       });
//   } catch (error) {
//       console.error('Error storing token:', error);
//       res.status(500).json({ success: false, errorMessage: 'Failed to store token' });
//   }
// });

// authRoutes.get('/user/org/:userId', async (req, res) => {
//   const { userId } = req.params;  // Extract userId from the route parameter

//   try {
//     // Function to validate and convert userId
//     const validateUserId = (value) => {
//       if (typeof value !== 'string' && typeof value !== 'number') {
//         throw new Error('Invalid userId format');
//       }
//       return value;
//     };

//     let validatedUserId;
//     try {
//       validatedUserId = validateUserId(userId);
//       console.log('Validated User ID:', validatedUserId);
//     } catch (error) {
//       console.error('Error validating userId:', error.message);
//       return res.status(400).json({
//         success: false,
//         errorMessage: 'Invalid userId format',
//         errorDetails: 'UserId must be a valid string or number',
//       });
//     }

//     // Find user by userId
//     const user = await User.findOne({ userId: validatedUserId });

//     if (!user) {
//       console.error('User not found');
//       return res.status(404).json({
//         success: false,
//         errorMessage: 'User not found',
//         errorDetails: 'No user associated with this userId',
//       });
//     }

//     console.log('Found User:', JSON.stringify(user));

//     // Return organization-related data (orgName in this case)
//     const orgData = {
//       orgName: user.orgName,
//     };

//     console.log('Sending organization data:', JSON.stringify(orgData));

//     res.json({
//       success: true,
//       orgData,
//     });

//   } catch (error) {
//     console.error('Error fetching user organization data:', error.message);
//     console.error('Error stack:', error.stack);
//     res.status(500).json({
//       success: false,
//       errorMessage: 'Failed to fetch user organization data',
//       errorDetails: error.message,
//     });
//   }
// });



// export { authRoutes };


import express from 'express';
import { Router } from 'express';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import { sessionStorage } from '../controller/sessionStorage.js';
import mongoose from 'mongoose';

const authRoutes = Router();

// Hash password function
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

// Generate JWT token function
function generateJWT(userId) {
  const secretKey = process.env.JWT_SECRET;
  console.log('Generating JWT with secret:', secretKey);
  const token = jwt.sign({ userId }, secretKey, { expiresIn: '12h' });
  return token;
}

// Validate password function
async function validatePassword(password, hashedPassword) {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return isValid;
  } catch (error) {
    console.error('Error validating password:', error);
    throw error;
  }
}

// Authentication middleware function
async function authenticationToken(req, res, next) {
  console.log('Authentication middleware called');

  const token = req.cookies.token; // ✅ read from cookies

  if (!token) {
    console.error('Token missing in cookies');
    return res.status(401).json({ message: 'Token missing in cookies' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}

// Auth routes
// authRoutes.post('/register', async (req, res) => {
//     console.log('Received register request:', req.body);
//     try {
//         const { name, orgName, email, password } = req.body;

//         // Validate input
//         if (!name || !orgName || !email || !password) {
//             return res.status(400).json({ 
//                 success: false, 
//                 errorMessage: 'Missing required fields' 
//             });
//         }

//         // Hash password
//         const hashedPassword = await hashPassword(password);

//         // Check if email already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(409).json({
//                 success: false,
//                 errorMessage: 'Email already registered. Please choose a different email address.',
//                 errorDetails: 'Duplicate email found'
//             });
//         }

//         // Generate unique userId
//         const userId = crypto.randomUUID(); // Generate the userId here

//         // Create user and assign userId
//         const user = new User({ 
//             name, 
//             orgName, 
//             email, 
//             passwordHash: hashedPassword,
//             userId: userId // Assign the userId here
//         });

//         // Save the user to the database
//         await user.save();

//         // Generate JWT token
//         const token = generateJWT(userId);

//         res.json({
//             success: true,
//             message: 'User registered successfully',
//             userId: userId,
//             token: token
//         });
//     } catch (error) {
//         console.error('Error during registration:', error);
//         res.status(500).json({
//             success: false,
//             errorMessage: 'Registration failed',
//             errorDetails: error.message
//         });
//     }
// });

authRoutes.post('/register', async (req, res) => {
  console.log('Received register request:', req.body);
  try {
    const { name, orgName, email, password, role } = req.body;

    // Validate input
    if (!name || !orgName || !email || !password || !role) {
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

    // Generate unique ID
    const userId = crypto.randomUUID();

    // Create user with _id set to userId
    const user = new User({
      _id: userId,  // Set _id directly
      userId: userId,  // Set userId field
      name,
      orgName,
      email,
      passwordHash: hashedPassword,
      role
    });

    // Save the user
    await user.save();

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

// Login route
authRoutes.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log("user====", user)
    if (!user) {
      return res.status(404).json({
        success: false,
        errorMessage: 'User not found',
        errorDetails: 'No account associated with this email'
      });
    }

    const isValidPassword = await validatePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        errorMessage: 'Invalid credentials',
        errorDetails: 'Incorrect email or password'
      });
    }

    // Generate JWT token
    const token = generateJWT(user._id); // Add more claims if needed
    res.cookie('token', token, {
      httpOnly: false,
      secure: true,
      sameSite: 'None',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });    console.log("token", token)

    // ✅ Send token in response body so frontend can store it in sessionStorage
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,              // 👈 Include token in response body
      userId: user._id, // 👈 Still send user ID
      user
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



// Logout route
authRoutes.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: false,
    sameSite: "Lax",
    secure: req.app.get("env") === "production",
  });

  res.json({ success: true, message: 'Logged out successfully' });
});


// for navbar1

// authRoutes.get('/userDetails', async (req, res) => {
//   console.log('Cookies received:', req.cookies);
//   try {
//     const token = req.cookies.token;
//     if (!token) {
//       return res.status(401).json({ success: false, message: 'No token found' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findOne({ userId: decoded.userId }).select('-passwordHash');

//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     res.json({ success: true, user });
//   } catch (error) {
//     console.error('Error in /userDetails:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });

authRoutes.get('/userDetails', async (req, res) => {
  console.log("userdetails api")
  try {
    let token = req.cookies.token;

    // ✅ If token not in cookies, try Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token found' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ userId: decoded.userId }).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error in /userDetails route:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


authRoutes.get('/test', (req, res) => {
  res.send('Test route works');
});


// Get user details route
authRoutes.get('/user', authenticationToken, async (req, res) => {
  try {
    console.log('Received request');
    const userId = req.user.userId;
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

    const user = await User.findById(userId);

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
      user,
      userId: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      orgName: user.orgName,
    };

    console.log('Sending user details:', JSON.stringify(userDetails));

    res.json(userDetails);

  } catch (error) {
    console.error('Error fetching user details:', error.message);
    res.status(500).json({
      success: false,
      errorMessage: 'Failed to fetch user details',
      errorDetails: error.message
    });
  }
});

// Store token route
authRoutes.post('/store-token', authenticationToken, async (req, res) => {
  const { userId, name, email } = req.user;

  try {
    res.json({
      success: true,
      message: 'Token and user data received successfully',
      token: req.headers.authorization.split(' ')[1],
      userData: { userId, name, email }
    });
  } catch (error) {
    console.error('Error storing token:', error);
    res.status(500).json({ success: false, errorMessage: 'Failed to store token' });
  }
});

// Get user organization data
authRoutes.get('/user/org/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
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
        errorDetails: 'UserId must be a valid string or number',
      });
    }

    const user = await User.findOne({ userId: validatedUserId });

    if (!user) {
      console.error('User not found');
      return res.status(404).json({
        success: false,
        errorMessage: 'User not found',
        errorDetails: 'No user associated with this userId',
      });
    }

    console.log('Found User:', JSON.stringify(user));

    const orgData = { orgName: user.orgName };

    console.log('Sending organization data:', JSON.stringify(orgData));

    res.json({
      success: true,
      orgData,
    });

  } catch (error) {
    console.error('Error fetching user organization data:', error.message);
    res.status(500).json({
      success: false,
      errorMessage: 'Failed to fetch user organization data',
      errorDetails: error.message,
    });
  }
});


// Route to fetch all users from the database
authRoutes.get('/all-users', async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash'); // exclude passwordHash field

    console.log('All users from DB:', users); // ✅ Log to console

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      errorMessage: 'Failed to fetch users',
      errorDetails: error.message
    });
  }
});

// Get user organization data
authRoutes.get('/user/org/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
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
        errorDetails: 'UserId must be a valid string or number',
      });
    }

    const user = await User.findOne({ userId: validatedUserId });

    if (!user) {
      console.error('User not found');
      return res.status(404).json({
        success: false,
        errorMessage: 'User not found',
        errorDetails: 'No user associated with this userId',
      });
    }

    console.log('Found User:', JSON.stringify(user));

    const orgData = { orgName: user.orgName };

    console.log('Sending organization data:', JSON.stringify(orgData));

    res.json({
      success: true,
      orgData,
    });

  } catch (error) {
    console.error('Error fetching user organization data:', error.message);
    res.status(500).json({
      success: false,
      errorMessage: 'Failed to fetch user organization data',
      errorDetails: error.message,
    });
  }
});

export { authRoutes };
