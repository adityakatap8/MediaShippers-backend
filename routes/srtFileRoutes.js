// srtFileRoutes.js

import express from 'express';

// Import specific methods from the controller (use named imports)
import { uploadFile, getFiles, deleteFile } from '../controller/srtFileController.js';

const srtFileRouter = express.Router();

// Define routes using the imported methods
srtFileRouter.post('/upload', uploadFile);            // Upload SRT file
srtFileRouter.get('/', getFiles);                     // Get all SRT files
srtFileRouter.delete('/:id', deleteFile);            // Delete SRT file by ID

// Export the router
export default srtFileRouter;
