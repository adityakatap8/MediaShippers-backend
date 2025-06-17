import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { uploadFileToS3 } from '../services/s3Service.js'

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// Folder creation in S3 (unchanged)
export const createFolder = async (folderPath) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${folderPath}/`,
    };
    try {
        await s3.putObject(params).promise();
        console.log(`Folder ${folderPath} created successfully.`);
    } catch (error) {
        console.error('Error creating folder:', error);
        throw new Error('Failed to create folder in S3');
    }
};

// File upload to S3
export const uploadFile = async (folderPath, file) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${folderPath}/${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,  // Ensure Content-Type is set
    };
    try {
        const uploadResult = await s3.upload(params).promise();
        console.log(`File ${file.originalname} uploaded successfully.`, uploadResult);
        return uploadResult;  // Returning the result
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
};

// File upload handler
// File upload handler
// export const uploadFileHandler = async (req, res) => {
//     const { orgName, projectName } = req.body;  // Getting orgName and projectName
//     const file = req.file;

//     if (!orgName || !projectName || !file) {
//         return res.status(400).send('Organization name, project name, and file are required.');
//     }

//     try {
//         // Upload the file to S3
//         await uploadFile(orgName, projectName, file);
//         res.status(200).send({ message: 'File uploaded successfully.' });
//     } catch (error) {
//         console.error('Error uploading file:', error);
//         res.status(500).send({ error: `Error uploading file: ${error.message}` });
//     }
// };

// export const uploadFileHandler = async (req, res) => {
//     const { orgName, projectName } = req.body;  // Extract orgName and projectName from request body
//     const { projectPoster, projectBanner, projectTrailer } = req.files;  // Extract files from request

//     // Check if orgName and projectName are present
//     if (!orgName || !projectName || !projectPoster || !projectBanner) {
//       return res.status(400).send({ message: 'Organization name, project name, and both projectPoster and projectBanner are required.' });
//     }

//     try {
//       // Prepare the files for uploading with correct types
//       const filesToUpload = [];

//       // Handle the projectPoster file
//       if (projectPoster && projectPoster[0]) {
//         filesToUpload.push({
//           originalname: projectPoster[0].originalname,
//           buffer: projectPoster[0].buffer,
//           mimetype: projectPoster[0].mimetype,
//           type: 'projectPoster'  // Type to differentiate file category
//         });
//       }

//       // Handle the projectBanner file
//       if (projectBanner && projectBanner[0]) {
//         filesToUpload.push({
//           originalname: projectBanner[0].originalname,
//           buffer: projectBanner[0].buffer,
//           mimetype: projectBanner[0].mimetype,
//           type: 'projectBanner'  // Type to differentiate file category
//         });
//       }

//       // Handle the projectTrailer file (optional)
//       if (projectTrailer && projectTrailer[0]) {
//         filesToUpload.push({
//           originalname: projectTrailer[0].originalname,
//           buffer: projectTrailer[0].buffer,
//           mimetype: projectTrailer[0].mimetype,
//           type: 'projectTrailer'  // Type to differentiate file category
//         });
//       } else {
//         console.log('Trailer file is missing. Continuing without it.');
//       }

//       // Upload the files to S3 by calling the service
//       const uploadResults = await uploadFileToS3(orgName, projectName, filesToUpload);

//       // If any files fail to upload, handle it
//       if (!uploadResults || uploadResults.length < 2) {  // We expect at least 2 files (poster and banner)
//         return res.status(500).send({ message: 'Error uploading files to S3' });
//       }

//       // Construct the file paths dynamically based on orgName and projectName
//       const fileUrls = uploadResults.map(result => {
//         // Check if result.Key is defined
//         if (!result.Key) {
//           console.error('Missing Key in the upload result:', result);
//           return null;  // Return null if Key is missing
//         }

//         // Return the S3 path without prepending s3://testmediashippers/ again
//         return result.Key;
//       }).filter(url => url !== null);  // Filter out null values (if any)

//       // Construct the names of the files
//       const fileNames = fileUrls.map(url => {
//         // Check if the fileUrl is defined and then split
//         if (!url) {
//           return null;  // Return null if url is missing
//         }

//         return url.split('/').pop(); // Get the file name (last part of the path)
//       }).filter(name => name !== null);  // Filter out null values (if any)

//       // Send success response with the file URLs and file names
//       res.status(200).send({
//         message: 'Files uploaded successfully.',
//         projectPosterUrl: {
//           fileUrl: fileUrls[0],
//           fileName: fileNames[0]
//         },  // Poster file URL and file name
//         projectBannerUrl: {
//           fileUrl: fileUrls[1],
//           fileName: fileNames[1]
//         },  // Banner file URL and file name
//         projectTrailerUrl: projectTrailer ? {
//           fileUrl: fileUrls[2],
//           fileName: fileNames[2]
//         } : 'Trailer file is missing'  // Trailer file URL and file name (if exists)
//       });
//     } catch (error) {
//       console.error('Error during file upload:', error);
//       res.status(500).send({ message: 'Failed to upload files', error: error.message });
//     }
// };


export const uploadFileHandler = async (req, res) => {
  const { orgName = '', projectName = '' } = req.body;
  const { projectPoster, projectBanner, projectTrailer } = req.files;

  console.log('Received request:', req.body);
  console.log('Files received:', req.files);

  try {
    const filesToUpload = [];

    if (projectPoster && projectPoster[0]) {
      filesToUpload.push({
        originalname: projectPoster[0].originalname,
        buffer: projectPoster[0].buffer,
        mimetype: projectPoster[0].mimetype,
        type: 'projectPoster'
      });
    }

    if (projectBanner && projectBanner[0]) {
      filesToUpload.push({
        originalname: projectBanner[0].originalname,
        buffer: projectBanner[0].buffer,
        mimetype: projectBanner[0].mimetype,
        type: 'projectBanner'
      });
    }

    if (projectTrailer && projectTrailer[0]) {
      filesToUpload.push({
        originalname: projectTrailer[0].originalname,
        buffer: projectTrailer[0].buffer,
        mimetype: projectTrailer[0].mimetype,
        type: 'projectTrailer'
      });
    }

    if (filesToUpload.length === 0) {
      return res.status(400).json({ message: 'No files were provided for upload.' });
    }

    const uploadResults = await uploadFileToS3(orgName, projectName, filesToUpload);

    if (!uploadResults || uploadResults.length !== filesToUpload.length) {
      return res.status(500).json({ message: 'Error uploading files to S3' });
    }

    // Build response dynamically based on what was uploaded
    const responsePayload = { message: 'Files uploaded successfully.' };

    uploadResults.forEach((fileUrl, index) => {
      const fileName = fileUrl.split('/').pop();
      const type = filesToUpload[index].type;
    
      responsePayload[`${type}Url`] = {
        fileUrl,
        fileName
      };
    });
    

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error during file upload:', error);
    return res.status(500).json({ message: 'Failed to upload files', error: error.message });
  }
};


  
  