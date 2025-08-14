// routes/fileRoutes.js

import express from 'express';
import multer from 'multer';
import { uploadFileToS3,deleteFile,deleteFolder } from '../services/s3Service.js';
import ProjectInfo from '../models/projectFormModels/FormModels/ProjectInfoSchema.js';
import SrtInfoFileSet from '../models/projectFormModels/FormModels/SrtInfoFileSchema.js';

const router = express.Router();
const upload = multer();


router.post('/upload-file', upload.any(), async (req, res) => {
  try {
    console.log('===== 📦 DEBUG: Received multipart form data =====');
    console.log('📝 req.body:', req.body);
    console.log('📎 req.files:', req.files);

    const { orgName, projectName, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const files = req.files.map((file) => {
      let type = '';
      let language = null;

      if (file.fieldname === 'projectPoster') type = 'projectPoster';
      else if (file.fieldname === 'projectBanner') type = 'projectBanner';
      else if (file.fieldname === 'projectTrailer') type = 'projectTrailer';
      else if (file.fieldname.startsWith('dubbedTrailer_')) {
        type = 'dubbedTrailer';
        const index = file.fieldname.split('_')[1];
        language = req.body[`dubbedTrailerLang_${index}`];
      } else if (file.fieldname.startsWith('dubbedSubtitle_')) {
        type = 'dubbedSubtitle';
        const index = file.fieldname.split('_')[1];
        language = req.body[`dubbedSubtitleLang_${index}`];
      } else if (file.fieldname.startsWith('srtFile_')) {
        type = 'srtFile';
      } else if (file.fieldname.startsWith('infoDocFile_')) {
        type = 'infoDocFile';
      }

      return { ...file, type, language };
    });

    const fileUrls = await uploadFileToS3(orgName, projectName, files);

    const response = {
      message: 'Files uploaded successfully.',
      dubbedFiles: [],
      srtFiles: [],
      infoDocuments: [],
      projectPosterUrl: '',
      projectBannerUrl: '',
      projectTrailerUrl: ''
    };

    const dubbedFilesMap = {};
    const srtFilesForDb = [];
    const infoDocFilesForDb = [];

    files.forEach((file, index) => {
      const fileUrl = fileUrls[index];
      const meta = {
        fileName: file.originalname,
        fileUrl: fileUrl
      };

      switch (file.type) {
        case 'projectPoster':
          response.projectPosterUrl = fileUrl;
          break;
        case 'projectBanner':
          response.projectBannerUrl = fileUrl;
          break;
        case 'projectTrailer':
          response.projectTrailerUrl = fileUrl;
          break;
        case 'dubbedTrailer':
        case 'dubbedSubtitle':
          if (!dubbedFilesMap[file.language]) {
            dubbedFilesMap[file.language] = { language: file.language };
          }
          if (file.type === 'dubbedTrailer') {
            dubbedFilesMap[file.language].dubbedTrailer = meta;
          } else {
            dubbedFilesMap[file.language].dubbedSubtitle = meta;
          }
          break;
        case 'srtFile':
          response.srtFiles.push(meta);
          srtFilesForDb.push(meta);
          break;
        case 'infoDocFile':
          response.infoDocuments.push(meta);
          infoDocFilesForDb.push(meta);
          break;
      }
    });

    const dubbedArray = Object.values(dubbedFilesMap);
    if (dubbedArray.length > 0) {
      response.dubbedFiles = dubbedArray;

      await ProjectInfo.findOneAndUpdate(
        { projectName },
        {
          $set: {
            dubbedFileData: dubbedArray.map(df => ({
              language: df.language,
              dubbedTrailerFileName: df.dubbedTrailer?.fileName || '',
              dubbedTrailerUrl: df.dubbedTrailer?.fileUrl || '',
              dubbedSubtitleFileName: df.dubbedSubtitle?.fileName || '',
              dubbedSubtitleUrl: df.dubbedSubtitle?.fileUrl || ''
            }))
          }
        },
        { new: true }
      );
    }

    if (srtFilesForDb.length > 0 || infoDocFilesForDb.length > 0) {
      console.log('📥 Preparing to save to SrtInfoFileSet collection...');
      console.log('🔡 SRT Files to Save:', JSON.stringify(srtFilesForDb, null, 2));
      console.log('📄 Info Documents to Save:', JSON.stringify(infoDocFilesForDb, null, 2));
      console.log('🧾 Metadata =>', { userId, projectName, orgName });

      await SrtInfoFileSet.findOneAndUpdate(
        { userId, projectName },
        {
          $set: {
            orgName,
            srtFiles: srtFilesForDb,
            infoDocuments: infoDocFilesForDb
          }
        },
        { upsert: true, new: true }
      );

      console.log('✅ SRT Info and InfoDocs saved successfully.');
    }

    res.status(200).json({
      ...response,
      srtInfo: {
        srtFiles: srtFilesForDb,
        infoDocuments: infoDocFilesForDb,
        projectName,
        orgName,
        userId
      }
    });

  } catch (error) {
    console.error('❌ Error in file upload route:', error);
    res.status(500).send(error.message);
  }
});



// DELETE a file from S3
router.delete('/delete-file', async (req, res) => {
  try {
    const { filePath } = req.query;

    if (!filePath) {
      return res.status(400).json({ message: 'Missing filePath query param' });
    }

    await deleteFile(filePath);
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    res.status(500).json({ error: error.message });
  }
});


// DELETE a folder and all contents from S3
// router.delete('/delete-folder', async (req, res) => {
//   try {
//     // Folder path should come in request body (as JSON)
//     const { folderPath } = req.body;

//     if (!folderPath) {
//       return res.status(400).json({ message: 'Missing folderPath in request body' });
//     }

//     await deleteFolder(folderPath);

//     res.status(200).json({ message: `Folder "${folderPath}" deleted successfully` });
//   } catch (error) {
//     console.error('❌ Error deleting folder:', error);
//     res.status(500).json({ error: error.message });
//   }
// });


router.delete('/delete-folder', async (req, res) => {
  try {
    const { folderPath } = req.body;

    if (!folderPath) {
      return res.status(400).json({ success: false, message: 'Missing folderPath in request body' });
    }

    console.log("🗂️ Deleting S3 folder:", folderPath);

    const result = await deleteFolder(folderPath);

    return res.status(200).json(result); // success response

  } catch (error) {
    console.error('❌ Error deleting folder:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete folder from S3',
      error: error.message || 'Unknown error',
    });
  }
});





export default router;
