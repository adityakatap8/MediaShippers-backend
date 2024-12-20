import express from 'express';
import orderType from './routes/orderType.js';
import { authenticateToken } from './middlewares/authMiddleware.js';
import { authRoutes } from './routes/authRoutes.js';
import sourceTypeRouter from './routes/SourceRoutes.js';
import servicesRoutes from './routes/servicesRoutes.js'
import destinationRoutes from './routes/destinationRoutes.js';
import formRoutes from './routes/formRoutes.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; 
import cors from 'cors';
import cookieParser from 'cookie-parser';
import projectFormRouter from './routes/projectFormRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['X-Requested-With', 'Content-Type'], // Add 'Content-Type' to the allowed headers
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ordertype', orderType);
app.use('/api/sourcetype', sourceTypeRouter)
app.use('/api/services', servicesRoutes);
app.use('/api/submitform', formRoutes);
app.use('/api/destinationtype', destinationRoutes);
app.use('/api/projectForm', projectFormRouter);

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

  app.get('/filestash', authenticateToken, (req, res) => {
    // Allow iframe embedding
    res.setHeader('X-Frame-Options', 'ALLOWALL'); // This allows iframe embedding.
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    
    // Serve Filestash UI via iframe
    res.send(`
      <html>
        <head>
          <title>Filestash</title>
        </head>
        <body>
          <iframe src="http://localhost:8334" width="100%" height="600px" frameborder="0"></iframe>
        </body>
      </html>
    `);
  });
  
