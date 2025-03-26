// routes/uploadRoutes.js

import express from 'express';
import { uploadFileHandler } from '../controller/fileController.js';
import multer from 'multer';

const upload = multer();  // Using multer to handle the files

const router = express.Router();

// POST endpoint to handle file upload
router.post('/upload-file', upload.fields([
  { name: 'projectPoster', maxCount: 1 },
  { name: 'projectBanner', maxCount: 1 },
  { name: 'projectTrailer', maxCount: 1 }
]), uploadFileHandler);

export default router;
