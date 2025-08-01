// controllers/transferFileController.js
import dotenv from 'dotenv';
import ProjectInfo from '../models/projectFormModels/FormModels/ProjectInfoSchema.js';
import { transferFilesBetweenBuckets } from '../services/s3Service.js';

dotenv.config();

export const transferFileController = async (req, res) => {
  const {
    orgName, projectFolder,
    posterFileUrl, bannerFileUrl,
    trailerUrl, movieUrl,
    infoDocs = [], srtFiles = [], dubbedFiles = []
  } = req.body;

  if (!orgName || !projectFolder) {
    return res.status(400).json({ error: 'Missing orgName or projectFolder' });
  }

  const result = {
    posterFileUrl: '', bannerFileUrl: '',
    trailerFileUrl: '', movieFileUrl: '',
    infoDocs: [], srtFiles: [], dubbedFiles: [], errors: []
  };

  const tasks = [
    { label: 'poster', source: posterFileUrl, dest: req.body.projectPosterS3Url },
    { label: 'banner', source: bannerFileUrl, dest: req.body.projectBannerS3Url },
    { label: 'trailer', source: trailerUrl, dest: req.body.projectTrailerS3Url },
    { label: 'movie', source: movieUrl, dest: req.body.projectMovieS3Url }
  ];

  for (let t of tasks) {
    if (t.source && t.dest) {
      try {
        const { url } = await transferFilesBetweenBuckets(t.source, t.dest, t.label);
        result[`${t.label}FileUrl`] = url;
      } catch (err) {
        console.error(`Error copying ${t.label}:`, err.message);
        result.errors.push({ fileType: t.label, error: err.message });
      }
    }
  }

  // You can implement similar loop for infoDocs, srtFiles, dubbedFiles
  // (loop through arrays and each get a URL from transferFilesBetweenBuckets)

  // Save updated URLs to MongoDB
  const updates = {};
  ['poster', 'banner', 'trailer', 'movie'].forEach((t) => {
    const key = `${t}FileUrl`;
    if (result[key]) {
      updates[`project${t.charAt(0).toUpperCase() + t.slice(1)}S3Url`] = result[key];
      updates[`${t}FileName`] = result[key].split('/').pop();
    }
  });
  if (Object.keys(updates).length) {
    await ProjectInfo.findOneAndUpdate({ projectName: projectFolder }, { $set: updates });
  }

  return res.status(result.errors.length ? 207 : 200).json({
    success: result.errors.length === 0,
    message: result.errors.length ? 'Partial failures' : 'All files transferred',
    ...result
  });
};
