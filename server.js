import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import compression from 'compression';
import morgan from 'morgan';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ---------------- Route Imports ----------------
import orderType from './routes/orderType.js';
import sourceTypeRouter from './routes/SourceRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import formRoutes from './routes/formRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import userInfoRouter from './routes/userInfoRoutes.js';
import projectFormRouter from './routes/projectFormRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import projectInfoRoutes from './routes/projectInfoRoutes.js';
import rightsInfoRoutes from './routes/rightsInfoRoutes.js';
import srtFileRouter from './routes/srtFileRoutes.js';
import { deleteItemHandler } from './controller/folderController.js';
import { authenticateToken } from './middlewares/authMiddleware.js';

dotenv.config();

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// ---------------- CORS Setup ----------------
// const corsOptions = {
//   origin: (origin, callback) => {
//     const allowedOrigins = [
//       'http://localhost:5173',
//       'http://127.0.0.1:5173',
//       'http://localhost:3000',
//       'http://127.0.0.1:3000',
//     ];
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
//   credentials: true,
// };

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5175', // <-- include this
    'http://127.0.0.1:5175',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(compression());

// ---------------- Logger (morgan) ----------------
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Dev-friendly logs
} else {
  const logDirectory = path.resolve(__dirname, 'logs');
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }
  const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });
  app.use(morgan('combined', { stream: accessLogStream }));
}

// ---------------- Serve Static Files ----------------
const distPath = path.join(__dirname, 'client', 'dist'); // Adjust if needed
app.use(express.static(distPath));

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

// ---------------- Fallback for SPA (React) ----------------
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ---------------- MongoDB Connection ----------------
async function connect() {
  try {
    console.log(`🔗 Connecting to MongoDB at ${process.env.mongo_url}`);
    await mongoose.connect(process.env.mongo_url);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// ---------------- Start Server ----------------
connect().then(() => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://0.0.0.0:${port}`);
  });
});
