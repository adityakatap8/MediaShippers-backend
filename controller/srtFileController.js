// srtFileController.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import SrtInfoFileSchema from "../models/projectFormModels/FormModels/SrtInfoFileSchema.js";

// Set up multer for file storage (temporary storage, will be used to read files before saving locally)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/srtInfoFiles/'); // Temporary storage for the uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Files will be saved with a timestamp
  }
});

// Multer setup for handling multiple files (srtFile and infoDocFile)
const upload = multer({ storage }).fields([
  { name: 'srtFile', maxCount: 1 },
  { name: 'infoDocFile', maxCount: 1 },
]);

// Controller for uploading both SRT and Info Doc files
export const uploadFiles = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading files', error: err });
    }

    try {
      const { srtFile, infoDocFile } = req.files;

      if (!srtFile || !infoDocFile) {
        return res.status(400).json({ message: 'Both SRT file and Info Doc file are required' });
      }

      // Prepare file details for SRT file
      const srtFileName = srtFile[0].filename;
      const srtFilePath = srtFile[0].path;  // Local path to the SRT file
      const srtFileType = srtFile[0].mimetype;
      const srtFileSize = srtFile[0].size;

      // Prepare file details for Info Doc file
      const infoDocFileName = infoDocFile[0].filename;
      const infoDocFilePath = infoDocFile[0].path;  // Local path to the Info Doc file
      const infoDocFileType = infoDocFile[0].mimetype;
      const infoDocFileSize = infoDocFile[0].size;

      // Save file details in the database using the updated schema name (SrtInfoFileSchema)
      const newFileSet = new SrtInfoFileSchema({
        srtFileName,
        srtFilePath,  // Save the local file path for the SRT file
        srtFileType,
        srtFileSize,
        infoDocFileName,
        infoDocFilePath,  // Save the local file path for the Info Doc file
        infoDocFileType,
        infoDocFileSize,
        category: 'srt',  // You can customize the category based on the type (e.g., 'srt' or 'infoDoc')
        userId: req.body.userId,  // Assuming userId is passed in the body
        projectName: req.body.projectName,  // Assuming projectName is passed in the body
        orgName: req.body.orgName || '',  // Optional: Assuming orgName is passed in the body
      });

      // Save to the database
      await newFileSet.save();

      // Return the fileId and file details in the response
      res.status(201).json({
        message: 'Files uploaded and saved successfully',
        fileSet: {
          id: newFileSet._id,   // File ID
          srtFile: {
            name: newFileSet.srtFileName,
            path: newFileSet.srtFilePath,
            type: newFileSet.srtFileType,
          },
          infoDocFile: {
            name: newFileSet.infoDocFileName,
            path: newFileSet.infoDocFilePath,
            type: newFileSet.infoDocFileType,
          }
        },
      });

    } catch (error) {
      console.error('Error uploading files:', error);
      res.status(500).json({ message: 'Error uploading files', error: error.message });
    }
  });
};


// 📤 Upload a single SRT or Info Doc file individually
export const uploadSingleFile = (req, res) => {
  const singleUpload = multer({ storage }).single('file');

  singleUpload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file', error: err });
    }

    try {
      const file = req.file;
      const { userId, projectName, orgName, category } = req.body;

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const newFile = new SrtInfoFileSchema({
        category: category || 'srt', // 'srt' or 'infoDoc'
        userId: userId || '',
        projectName: projectName || '',
        orgName: orgName || '',
      });

      // Assign file metadata based on category
      if (category === 'infoDoc') {
        newFile.infoDocFileName = file.filename;
        newFile.infoDocFilePath = file.path;
        newFile.infoDocFileType = file.mimetype;
        newFile.infoDocFileSize = file.size;
      } else {
        newFile.srtFileName = file.filename;
        newFile.srtFilePath = file.path;
        newFile.srtFileType = file.mimetype;
        newFile.srtFileSize = file.size;
      }

      await newFile.save();

      res.status(201).json({
        message: 'File uploaded successfully',
        fileId: newFile._id, // ✅ return this to frontend
        category,
        filePath: file.path,
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
};


// Controller for getting all files
export const getFiles = async (req, res) => {
  try {
    const files = await SrtInfoFileSchema.find();  // Use the updated schema to fetch file details
    res.status(200).json({ message: 'Files retrieved successfully', files });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving files', error: error.message });
  }
};

// Controller for deleting a file
export const deleteFile = async (req, res) => {
  const { fileId } = req.params;

  try {
    const file = await SrtInfoFileSchema.findById(fileId);  // Use the updated schema
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Remove the file from the local file system if needed
    fs.unlinkSync(file.srtFilePath);
    fs.unlinkSync(file.infoDocFilePath);

    // Remove the file entry from the database
    await SrtInfoFileSchema.findByIdAndDelete(fileId);  // Use the updated schema to delete the record
    res.status(200).json({ message: 'Files deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting files', error: error.message });
  }
};
