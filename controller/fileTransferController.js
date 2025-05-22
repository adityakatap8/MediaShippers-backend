// filesTransferController.js

import { transferFilesBetweenBuckets } from '../services/s3Service.js'; // Import the file transfer service

// Controller to handle file transfer between S3 buckets
export const transferFileController = async (req, res) => {
  const { posterFileUrl, bannerFileUrl, trailerFileUrl, movieFileUrl, orgName, projectFolder, accessKeyId, secretAccessKey } = req.body;

  // Validate the required fields
  if (!orgName || !projectFolder || !accessKeyId || !secretAccessKey) {
    return res.status(400).json({ error: 'Organization name, project folder, and credentials are required.' });
  }

  try {
    // Process each file type
    const transferData = [
      { fileUrl: posterFileUrl, fileType: 'poster' },
      { fileUrl: bannerFileUrl, fileType: 'banner' },
      { fileUrl: trailerFileUrl, fileType: 'trailer' },
      { fileUrl: movieFileUrl, fileType: 'movie' },
    ];

    // Loop through the file data and transfer each file if it exists
    for (let file of transferData) {
      if (file.fileUrl && typeof file.fileUrl === 'string') {
        console.log(`Transferring ${file.fileType}...`);
        const fileName = file.fileUrl.split('/').pop();  // Extracting the file name from the URL
        const result = await transferFilesBetweenBuckets(file.fileUrl, orgName, projectFolder, fileName, accessKeyId, secretAccessKey, file.fileType);
        console.log(`${file.fileType} transfer successful:`, result.message);
      } else {
        console.log(`Skipping ${file.fileType} as the fileUrl is invalid:`, file.fileUrl);
      }
    }

    // Return a success response
    return res.status(200).json({ message: 'File transfers completed successfully.' });
  } catch (error) {
    console.error('Error during file transfer:', error);
    return res.status(500).json({ error: error.message || 'Failed to transfer file.' });
  }
};
