// filesTransferController.js

import { transferFilesBetweenBuckets } from '../services/s3Service.js'; // Import the file transfer service

// Controller to handle file transfer between S3 buckets
export const transferFileController = async (req, res) => {
  const {
    posterFileUrl,
    bannerFileUrl,
    trailerFileUrl,
    movieFileUrl,
    orgName,
    projectFolder,
    accessKeyId,
    secretAccessKey,
    dubbedFiles = [],
    srtFiles = [],
    infoDocs = [],
  } = req.body;

  if (!orgName || !projectFolder || !accessKeyId || !secretAccessKey) {
    return res.status(400).json({ error: 'Organization name, project folder, and credentials are required.' });
  }

  const errors = [];
  const transferredDubbedFiles = [];
  const transferredSrtFiles = [];
  const transferredInfoDocs = [];

  try {
    const transferData = [
      { fileUrl: posterFileUrl, fileType: 'poster' },
      { fileUrl: bannerFileUrl, fileType: 'banner' },
      { fileUrl: trailerFileUrl, fileType: 'trailer' },
      { fileUrl: movieFileUrl, fileType: 'movie' },
    ];

    for (let file of transferData) {
      if (file.fileUrl && typeof file.fileUrl === 'string') {
        try {
          const fileName = file.fileUrl.split('/').pop();
          await transferFilesBetweenBuckets(
            file.fileUrl,
            orgName,
            projectFolder,
            fileName,
            accessKeyId,
            secretAccessKey,
            file.fileType
          );
        } catch (err) {
          errors.push({ fileType: file.fileType, error: err.message });
        }
      }
    }

    for (let entry of dubbedFiles) {
      const { language, dubbedTrailerUrl, dubbedSubtitleUrl } = entry;
      const dubbedEntry = { language };

      if (dubbedTrailerUrl) {
        try {
          const trailerFileName = dubbedTrailerUrl.split('/').pop();
          const trailerResult = await transferFilesBetweenBuckets(
            dubbedTrailerUrl,
            orgName,
            projectFolder,
            trailerFileName,
            accessKeyId,
            secretAccessKey,
            `dubbedTrailer/${language}`
          );
          dubbedEntry.dubbedTrailerFileName = trailerFileName;
          dubbedEntry.dubbedTrailerUrl = trailerResult.destinationUrl;
        } catch (err) {
          errors.push({ fileType: `dubbedTrailer/${language}`, error: err.message });
        }
      }

      if (dubbedSubtitleUrl) {
        try {
          const subtitleFileName = dubbedSubtitleUrl.split('/').pop();
          const subtitleResult = await transferFilesBetweenBuckets(
            dubbedSubtitleUrl,
            orgName,
            projectFolder,
            subtitleFileName,
            accessKeyId,
            secretAccessKey,
            `dubbedSubtitle/${language}`
          );
          dubbedEntry.dubbedSubtitleFileName = subtitleFileName;
          dubbedEntry.dubbedSubtitleUrl = subtitleResult.destinationUrl;
        } catch (err) {
          errors.push({ fileType: `dubbedSubtitle/${language}`, error: err.message });
        }
      }

      transferredDubbedFiles.push(dubbedEntry);
    }

    for (let entry of srtFiles) {
      const { language, srtUrl } = entry;
      if (srtUrl) {
        try {
          const fileName = srtUrl.split('/').pop();
          const srtResult = await transferFilesBetweenBuckets(
            srtUrl,
            orgName,
            projectFolder,
            fileName,
            accessKeyId,
            secretAccessKey,
            `srt/${language}`
          );
          transferredSrtFiles.push({
            language,
            fileName,
            srtUrl: srtResult.destinationUrl,
          });
        } catch (err) {
          errors.push({ fileType: `srt/${language}`, error: err.message });
        }
      }
    }

    for (let docUrl of infoDocs) {
      if (typeof docUrl === 'string') {
        try {
          const fileName = docUrl.split('/').pop();
          const docResult = await transferFilesBetweenBuckets(
            docUrl,
            orgName,
            projectFolder,
            fileName,
            accessKeyId,
            secretAccessKey,
            'infoDocs'
          );
          transferredInfoDocs.push({
            fileName,
            docUrl: docResult.destinationUrl,
          });
        } catch (err) {
          errors.push({ fileType: 'infoDocs', fileName: docUrl.split('/').pop(), error: err.message });
        }
      }
    }

    const success = errors.length === 0;

    return res.status(success ? 200 : 207).json({
      success,
      message: success
        ? 'All file transfers completed successfully.'
        : 'Some files failed to transfer.',
      dubbedFiles: transferredDubbedFiles,
      srtFiles: transferredSrtFiles,
      infoDocs: transferredInfoDocs,
      errors
    });

  } catch (error) {
    console.error('❌ Fatal error during file transfer:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
};



