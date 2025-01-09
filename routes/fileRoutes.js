import express from 'express';
import multer from 'multer';
import { uploadFileHandler } from '../controller/fileController.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/upload-file', upload.single('file'), uploadFileHandler);

export default router;
