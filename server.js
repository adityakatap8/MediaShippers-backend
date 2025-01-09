import express from 'express';
import orderType from './routes/orderType.js';
import { authenticateToken } from './middlewares/authMiddleware.js';
import { authRoutes } from './routes/authRoutes.js';
import sourceTypeRouter from './routes/SourceRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import formRoutes from './routes/formRoutes.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import projectFormRouter from './routes/projectFormRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import { deleteItemHandler } from './controller/folderController.js'; // Import the delete handler

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['X-Requested-With', 'Content-Type', 'Authorization'],
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ordertype', orderType);
app.use('/api/sourcetype', sourceTypeRouter);
app.use('/api/services', servicesRoutes);
app.use('/api/submitform', formRoutes);
app.use('/api/destinationtype', destinationRoutes);
app.use('/api/projectForm', projectFormRouter);

app.use('/api/folders', folderRoutes);
app.use('/api/files', fileRoutes);

app.use('/api/projects', projectFormRouter);

// Ensure authentication middleware is used for routes that need token validation
app.use(authenticateToken);

// Delete item route (for files or folders)
app.post('/api/delete-item', deleteItemHandler); // Add route for item deletion

// Test route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Database connection
async function connect() {
  try {
    await mongoose.connect(process.env.mongo_url);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

connect()
  .then(() => {
    const startServer = async () => {
      try {
        await app.listen(port, () => {
          console.log(`Server is running on http://localhost:${port}`);
        });
      } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
      }
    };

    startServer();
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
