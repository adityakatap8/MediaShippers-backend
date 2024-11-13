import express from 'express';
import orderType from './routes/orderType.js';
import { authenticateToken } from './middlewares/authMiddleware.js';
import { authRoutes } from './routes/authRoutes.js';
import sourceTypeRouter from './routes/SourceRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js'
import formRoutes from './routes/formRoutes.js'
import dotenv from 'dotenv';
import mongoose from 'mongoose'; 
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ordertype', orderType);
app.use('/api/sourcetype', sourceTypeRouter)
app.use('/api/services', servicesRoutes);
app.use('/api/submitform', formRoutes);
app.use(authenticateToken);

// Add your routes here
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
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });
