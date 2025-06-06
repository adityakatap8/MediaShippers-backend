// import express from 'express';
// import { createFolderHandler, listFolderContentsHandler, deleteItemHandler, getFoldersByOrgHandler, getAllProjectFolders, getSubfoldersController, createFolderController, uploadFileController } from '../controller/folderController.js';
// import multer from 'multer';
// const router = express.Router();
// const upload = multer();

// // Existing routes
// router.post('/create-folder', createFolderHandler);
// router.get('/list-folder', listFolderContentsHandler);
// router.post('/delete-item', deleteItemHandler);

// // New route to fetch folders by orgName
// router.get('/folders-by-org', getFoldersByOrgHandler);

// router.get('/get-project-folders/:orgName', getAllProjectFolders);

// router.get('/subfolders/:orgName/:projectName', getSubfoldersController);



// // Route to create a folder in S3
// router.post('/create-folder', createFolderController);

// // Route to upload a file to S3
// router.post('/upload-file', uploadFileController);

// export default router;



import express from 'express';
import {
  createFolderHandler,
  listFolderContentsHandler,
  deleteItemHandler,
  getFoldersByOrgHandler,
  getAllProjectFolders,
  getSubfoldersController,
  createFolderController,
  uploadFileController,
  createSubfoldersController,
  getSubfolderContentsController,
  getS3ObjByOrgHandler
} from '../controller/folderController.js';
import {transferFileController} from '../controller/fileTransferController.js';
import multer from 'multer';
import AWS from 'aws-sdk'
const router = express.Router();
const upload = multer();

// Existing routes
router.get('/list-folder', listFolderContentsHandler);
router.post('/delete-item', deleteItemHandler);

// New route to fetch folders by orgName
router.get('/folders-by-org', getFoldersByOrgHandler);

router.get('/get-project-folders/:orgName', getAllProjectFolders);

router.get('/subfolders/:orgName/:projectName', getSubfoldersController);

// Add a route to fetch contents inside a subfolder
router.get('/subfolder-contents/:orgName/:projectName/:subfolderName', getSubfolderContentsController);

// sukhada
router.post('/s3-list', getS3ObjByOrgHandler);

// download files

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: "AKIATKPD3X56KBBSX2K2",  // Use environment variables for security in production
  secretAccessKey: "1w3/mMbun6k4cGybvUWpKySNcXjOAjUj/J+gZb6A", // Avoid hardcoding secrets in production
  region: "eu-north-1", // Example: "us-east-1"
  signatureVersion: 'v4',
});

// Function to generate pre-signed URL
const getPresignedUrl = async (s3Url) => {
  const urlParts = s3Url.replace("s3://", "").split("/");
  const bucket = urlParts.shift();
  const key = urlParts.join("/");
  const params = {
    Bucket: bucket,
    Key: key,
    Expires: 3600, // Link expires in 1 hour
  };
  return await s3.getSignedUrlPromise("getObject", params);
};

router.post('/download-files', async (req, res) => {
  try {
    const { files } = req.body; // Expecting JSON with "files" array
    
    // Validate input
    if (!files || typeof files !== "string") {
      return res.status(400).json({ error: "Invalid input format. Expecting a single S3 URL string." });
    }
    
    // Generate pre-signed URLs for each file in the array
    const signedUrls = await getPresignedUrl(files);

    // Send back the generated pre-signed URLs
    res.json({ message: "Pre-signed URLs generated", urls: signedUrls });
  } catch (error) {
    // Error handling
    console.error('Error generating pre-signed URLs:', error);
    res.status(500).json({ error: "Failed to generate URLs", details: error.message });
  }
});


// Correct route to create a folder
router.post('/create-project-folder', createFolderController); // Changed path to avoid conflict

// In your routes (e.g., routes/folderRoutes.js)
router.post('/create-subfolders', createSubfoldersController);



// Route to upload a file to S3
router.post('/upload-file', uploadFileController);

router.post('/transfer-file', transferFileController);

export default router;

