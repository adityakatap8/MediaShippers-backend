// app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import fs from 'fs';
import morgan from 'morgan';

// ... rest of your route imports
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
import orgRoutes from './routes/orgRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import dealRoutes from './routes/dealRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const corsOptions = {
  origin: true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(cookieParser());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  const logDir = path.resolve(__dirname, 'logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
  app.use(morgan('combined', { stream: accessLogStream }));
}

// Mongo connection
mongoose.connect(process.env.mongo_url)
  .then(() => console.log('✅ Mongo connected'))
  .catch(err => console.error('❌ Mongo error:', err));

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
app.use('/api/organization', orgRoutes);

app.use('/api/cart', cartRoutes)

app.use('/api/deal', dealRoutes);

export default app;
