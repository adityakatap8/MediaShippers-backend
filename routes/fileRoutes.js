// routes/uploadRoutes.js

import express from 'express';
import { uploadFileHandler } from '../controller/fileController.js';
import { uploadFileToS3 } from '../services/s3Service.js';
import multer from 'multer';

const upload = multer();  // Using multer to handle the files

const router = express.Router();

router.post('/upload-file', upload.fields([
  { name: 'projectPoster', maxCount: 1 },
  { name: 'projectBanner', maxCount: 1 },
  { name: 'projectTrailer', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = [];

    if (req.files.projectPoster) {
      files.push({ ...req.files.projectPoster[0], type: 'projectPoster' });
    }
    if (req.files.projectBanner) {
      files.push({ ...req.files.projectBanner[0], type: 'projectBanner' });
    }
    if (req.files.projectTrailer) {
      files.push({ ...req.files.projectTrailer[0], type: 'projectTrailer' });
    }

    const orgName = req.body.orgName;
    const projectName = req.body.projectName;

    const fileUrls = await uploadFileToS3(orgName, projectName, files);

    const response = {
      message: 'Files uploaded successfully.',
    };

    files.forEach((file, index) => {
      if (file.type === 'projectPoster') response.projectPosterUrl = {
        fileName: file.originalname,
        fileUrl: fileUrls[index]
      };
      if (file.type === 'projectBanner') response.projectBannerUrl = {
        fileName: file.originalname,
        fileUrl: fileUrls[index]
      };
      if (file.type === 'projectTrailer') response.projectTrailerUrl = {
        fileName: file.originalname,
        fileUrl: fileUrls[index]
      };
    });

    res.json(response);
  } catch (error) {
    console.error('Error in file upload route:', error);
    res.status(500).send(error.message);
  }
});


export default router;
