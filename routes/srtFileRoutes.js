// srtFileRoutes.js

import express from 'express';

// Import specific methods from the controller (use named imports)
import { uploadFiles, getFiles, deleteFile, uploadSingleFile } from '../controller/srtFileController.js';

const srtFileRouter = express.Router();

// Define routes using the imported methods
srtFileRouter.post('/upload', uploadFiles);            // Upload SRT file and Info Doc file
srtFileRouter.get('/', getFiles);                     // Get all SRT files
srtFileRouter.delete('/:id', deleteFile);            // Delete SRT file by ID
srtFileRouter.post('/upload-file', uploadSingleFile); 

// Export the router
export default srtFileRouter;
