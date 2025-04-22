import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

// Route imports
import orderType from './routes/orderType.js';
import sourceTypeRouter from './routes/SourceRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import formRoutes from './routes/formRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import userInfoRouter from './routes/userInfoRoutes.js';

// Protected routes
import projectFormRouter from './routes/projectFormRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import projectInfoRoutes from './routes/projectInfoRoutes.js';
import rightsInfoRoutes from './routes/rightsInfoRoutes.js';
import srtFileRouter from './routes/srtFileRoutes.js';
import { deleteItemHandler } from './controller/folderController.js';

import { authenticateToken } from './middlewares/authMiddleware.js';
import orgRoutes from './routes/orgRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS options
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://www.mediashippers.com:3000',
      'https://13.61.14.53:3000',
      'https://172.31.27.22:3000',
      'https://www.mediashippers.com',
      'http://localhost:5173',
      'http://localhost:3000',
      '*'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  credentials: true,
};

app.options('*', cors(corsOptions));

// Force HTTPS (if behind a proxy/load balancer)
app.use((req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Static files
app.use(express.static(path.join('C:/mediashipper client 26-03-2025/dist')));

// ---------------- Public Routes ----------------
app.use('/api/auth', authRoutes);
app.use('/api/user', userInfoRouter);
app.use('/api/ordertype', orderType);
app.use('/api/sourcetype', sourceTypeRouter);
app.use('/api/services', servicesRoutes);
app.use('/api/submitform', formRoutes);
app.use('/api/destinationtype', destinationRoutes);

// ---------------- Protected Routes ----------------
app.use('/api/projectForm', authenticateToken, projectFormRouter);
app.use('/api/folders', authenticateToken, folderRoutes);
app.use('/api/files', authenticateToken, fileRoutes);
app.use('/api/projects', authenticateToken, projectFormRouter);
app.use('/api/project-form', authenticateToken, projectFormRouter);
app.use('/api/projectsInfo', authenticateToken, projectInfoRoutes);
app.use('/api/rightsinfo', authenticateToken, rightsInfoRoutes);
app.use('/api/srtFile', authenticateToken, srtFileRouter);
app.post('/api/delete-item', authenticateToken, deleteItemHandler);

// ---------------Cart API's----------------

// Add organization routes
app.use('/api/organization', orgRoutes);

// React app fallback
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join('C:/mediashipper client 26-03-2025/dist', 'index.html'));
});

// MongoDB connection
async function connect() {
  try {
    await mongoose.connect(process.env.mongo_url);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Start server
connect().then(() => {
  app.listen(port, 'localhost', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
});  
