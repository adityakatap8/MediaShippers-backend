import AWS from 'aws-sdk';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import SrtFile from '../models/projectFormModels/FormModels/SrtFileUpload.js'; // Adjust the path to your model

// Initialize the AWS S3 instance
const s3 = new AWS.S3();

// Set up multer for file storage (temporary storage, will be used to read file before uploading to S3)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/srtFiles/'); // Temporary storage for the uploaded file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // File will be saved with a timestamp
  }
});

const upload = multer({ storage }).single('srtFile');  // 'srtFile' is the field name in the form

// Controller for uploading file to S3
export const uploadFile = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file', error: err });
    }

    try {
      const { originalname, mimetype, size, path: filePath } = req.file;
      const { orgName, projectFolder, srtFileName } = req.body; // Extract orgName, projectFolder, and srtFileName from the request body

      // Construct the S3 path dynamically
      const s3Key = `${orgName}/${projectFolder}/srtFiles/${srtFileName}`;

      // Read the file content from the temporary storage
      const fileContent = fs.readFileSync(filePath);

      // Define the S3 upload parameters
      const params = {
        Bucket: 'mediashippers-filestash',  // Your S3 bucket name
        Key: s3Key,  // The dynamic path in S3
        Body: fileContent,  // The content of the file
        ContentType: mimetype,  // The MIME type of the file
        ACL: 'public-read',  // Set the file's ACL to public-read so that it can be accessed
      };

      // Upload the file to S3
      const s3Response = await s3.upload(params).promise();

      // Get the file URL from the S3 response
      const fileUrl = s3Response.Location;

      // Save file details in the database
      const newFile = new SrtFile({
        fileName: srtFileName,  // File name as received in the request body
        filePath: fileUrl,  // Save the S3 URL in the database
        fileType: mimetype,
        size: size,
      });

      // Save to the database
      await newFile.save();

      // Optionally, delete the temporary file after upload
      fs.unlinkSync(filePath);

      res.status(201).json({
        message: 'File uploaded successfully',
        file: newFile,
      });

    } catch (error) {
      console.error('Error uploading file to S3:', error);
      res.status(500).json({ message: 'Error uploading file to S3', error: error.message });
    }
  });
};

// Controller for getting all files
export const getFiles = async (req, res) => {
  try {
    const files = await SrtFile.find();
    res.status(200).json({ message: 'Files retrieved successfully', files });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving files', error: error.message });
  }
};

// Controller for deleting a file
export const deleteFile = async (req, res) => {
  const { fileId } = req.params;

  try {
    const file = await SrtFile.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Optionally, remove the file from the S3 bucket if needed
    const params = {
      Bucket: 'mediashippers-filestash', // Your S3 bucket name
      Key: file.filePath.split('mediashippers-filestash/')[1], // Extract the S3 path from the URL
    };

    await s3.deleteObject(params).promise();

    // Remove the file entry from the database
    await SrtFile.findByIdAndDelete(fileId);
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
};


