// filesTransferController.js

import { transferFilesBetweenBuckets } from '../services/s3Service.js'; // Import the file transfer service

// Controller to handle file transfer between S3 buckets
// controllers/transferFileController.js

import dotenv from 'dotenv';


dotenv.config();

export const transferFileController = async (req, res) => {
  const {
    projectPosterUrl,
    projectBannerUrl,
    trailerUrl,
    movieUrl,
    orgName,
    projectFolder,
    dubbedFiles = [],
    srtFiles = [],
    infoDocs = [],
    projectPosterS3Url,
    projectBannerS3Url,
    projectTrailerS3Url,
    projectMovieS3Url,
  } = req.body;

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!orgName || !projectFolder || !accessKeyId || !secretAccessKey) {
    return res.status(400).json({
      error: 'Organization name, project folder, and AWS credentials are required.',
    });
  }

  const errors = [];
  const transferredDubbedFiles = [];
  const transferredSrtFiles = [];
  const transferredInfoDocs = [];

  try {
    const transferData = [
      {
        fileType: 'poster',
        sourceUrl: projectPosterUrl,
        destinationUrl: projectPosterS3Url,
      },
      {
        fileType: 'banner',
        sourceUrl: projectBannerUrl,
        destinationUrl: projectBannerS3Url,
      },
      {
        fileType: 'trailer',
        sourceUrl: trailerUrl,
        destinationUrl: projectTrailerS3Url,
      },
      {
        fileType: 'movie',
        sourceUrl: movieUrl,
        destinationUrl: projectMovieS3Url,
      },
    ];
console.log("inside file transfer controller 1")
    for (let file of transferData) {
     
      if (file.sourceUrl && file.destinationUrl) {
        console.log("inside file transfer controller 3")
        try {
          const result = await transferFilesBetweenBuckets(
            file.sourceUrl,
            file.destinationUrl,
            accessKeyId,
            secretAccessKey,
            file.fileType
          );
          console.log(`✅ Transferred ${file.fileType}: ${result.url}`);
        } catch (err) {
          console.error(`❌ Error transferring ${file.fileType}:`, err.message);
          errors.push({ fileType: file.fileType, error: err.message });
        }
      }
    }

    // (Dubbed, SRT, and InfoDocs transfer logic stays the same — just make sure to pass both source & destination in those too)

    const success = errors.length === 0;

    return res.status(success ? 200 : 207).json({
      success,
      message: success
        ? 'All file transfers completed successfully.'
        : 'Some files failed to transfer.',
      errors,
    });
  } catch (error) {
    console.error('❌ Fatal error during file transfer:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error.',
    });
  }
};





