import mongoose from 'mongoose';
import ProjectFormViewerService from '../services/projectFormViewerService.js';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { deleteFolder, deleteFileFromUrl,deleteFile  } from '../services/s3Service.js'

// Mongoose models
import ProjectForm from '../models/projectFormModels/ProjectForm.js';
import ProjectInfo from '../models/projectFormModels/FormModels/ProjectInfoSchema.js';

import CreditsInfo from '../models/projectFormModels/FormModels/CreditsInfoSchema.js';
import SpecificationsInfo from '../models/projectFormModels/FormModels/SpecificationsInfo.js';
import RightsInfoGroup from '../models/projectFormModels/FormModels/RightsInfoSchema.js';
import SrtInfoFileSet from '../models/projectFormModels/FormModels/SrtInfoFileSchema.js';




// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(file.mimetype);
  const mimetype = fileTypes.test(file.originalname.toLowerCase());

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// ✅ Fix: Define modelMap outside the controller methods
const modelMap = {
  project: ProjectInfo,
  srt: SrtInfoFileSet,
  specs: SpecificationsInfo,
  rights: RightsInfoGroup,
  credits: CreditsInfo,
};


const projectFormDataController = {
  // Fetch project form data
getProjectFormData: async (req, res) => {
  const { id: projectId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const objectId = new mongoose.Types.ObjectId(projectId);

    // Step 1: Get the project form using projectInfo reference
    const projectForm = await ProjectForm.findOne({ projectInfo: objectId });

    if (!projectForm) {
      return res.status(404).json({ error: 'Project form not found' });
    }

    // Step 2: Fetch projectInfo first (we need it to get srtFilesId)
    const projectInfo = await ProjectInfo.findById(projectForm.projectInfo);

    if (!projectInfo) {
      return res.status(404).json({ error: 'ProjectInfo not found' });
    }

    // Step 3: Use the srtFilesId from projectInfo to fetch SRT data
    const [creditsInfo, specificationsInfo, rightsInfo, srtInfo] = await Promise.all([
      CreditsInfo.findById(projectForm.creditsInfo),
      SpecificationsInfo.findById(projectForm.specificationsInfo),
      RightsInfoGroup.findById(projectForm.rightsInfo?.[0]),
      SrtInfoFileSet.findById(projectInfo.srtFilesId), // ✅ correct reference
    ]);

    const responseData = {
      ...projectForm.toObject(),
      projectInfo,
      creditsInfo,
      specificationsInfo,
      rightsInfo,
      srtInfo, // ✅ rename back to srtInfo for clarity
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching project data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}


,

updateMultipleSections: async (req, res) => {
  const { id: projectId } = req.params;
  const updateData = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No update data provided.' });
    }

    const project = await ProjectInfo.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const sectionsMap = {
      projectInfo: { model: ProjectInfo, id: project._id },
      creditsInfo: { model: CreditsInfo, id: project.creditsInfoId },
      rightsInfo: { model: RightsInfoGroup, id: project.rightsInfoId },
      specificationsInfo: { model: SpecificationsInfo, id: project.specificationsInfoId },
      srtInfo: { model: SrtInfoFileSet, id: project.srtFilesId },
    };

    const updateResults = {};
    console.log('🔄 Incoming update sections:', Object.keys(updateData));

    for (const [section, { model, id }] of Object.entries(sectionsMap)) {
      const sectionUpdate = updateData[section];
      if (sectionUpdate && id && mongoose.Types.ObjectId.isValid(id)) {
        const updatedDoc = await model.findByIdAndUpdate(id, sectionUpdate, { new: true }).exec();
        if (updatedDoc) {
          updateResults[section] = {
            id: updatedDoc._id,
            updatedData: updatedDoc,
          };
        }
      } else if (sectionUpdate) {
        console.warn(`⚠️ Skipping ${section} update due to missing or invalid ID`);
      }
    }

    const recognizedSections = Object.keys(sectionsMap);
    const extraSections = Object.keys(updateData).filter(k => !recognizedSections.includes(k));
    if (extraSections.length > 0) {
      console.warn('⚠️ Unrecognized sections in request body:', extraSections);
    }

    if (Object.keys(updateResults).length === 0) {
      return res.status(400).json({ message: 'No valid sections to update or invalid IDs.' });
    }

    return res.status(200).json({
      message: '✅ Project and related sections updated successfully',
      updates: updateResults,
    });

  } catch (error) {
    console.error('❌ Error updating project and sections:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


,





// ✅ Controller function
deleteProject : async (req, res) => {
  const { id: projectId } = req.params;
  const { orgName, projectName } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    const project = await ProjectInfo.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Prepare deletions for linked documents
    const deletions = [];

    if (project.creditsInfoId) {
      deletions.push(CreditsInfo.deleteOne({ _id: project.creditsInfoId }));
    }

    if (project.rightsInfoId) {
      deletions.push(RightsInfoGroup.deleteOne({ _id: project.rightsInfoId }));
    }

    if (project.specificationsInfoId) {
      deletions.push(SpecificationsInfo.deleteOne({ _id: project.specificationsInfoId }));
    }

    if (project.srtFilesId) {
      deletions.push(SrtInfoFileSet.deleteOne({ _id: project.srtFilesId }));
    }

    // Run all subdocument deletions in parallel
    await Promise.all(deletions);

    // Delete main project document
    const deleteResult = await ProjectInfo.deleteOne({ _id: projectId });
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ error: 'Project could not be deleted' });
    }

    // Delete S3 folder
    const folderPath = `${orgName}/${project.projectName}/`;
    console.log(`🗂️ Deleting S3 folder: ${folderPath}`);

    try {
      await deleteFolder(folderPath); // assumes this is defined elsewhere
      console.log(`✅ S3 folder deleted`);
    } catch (s3Error) {
      console.error(`❌ Failed to delete S3 folder: ${s3Error.message}`);
    }

    return res.status(200).json({ message: 'Project and all related data deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting project:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
},


deleteFileFromS3: async (req, res) => {
  try {
    const { fileUrl, filePath } = req.query;
    const bucketName = process.env.S3_BUCKET_NAME;

    if (!bucketName) {
      return res.status(500).json({
        error: 'S3_BUCKET_NAME is not configured in environment variables',
      });
    }

    let resolvedFilePath = '';

    if (filePath) {
      // Direct path input (safe to decode)
      resolvedFilePath = decodeURIComponent(filePath);
    } else if (fileUrl) {
      let urlObj;
      try {
        urlObj = new URL(fileUrl);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      // ✅ Remove broken hostname validation – not reliable across regions or styles

      // 🔑 Extract and decode key (remove leading `/`)
      resolvedFilePath = decodeURIComponent(
        urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname
      );
    } else {
      return res.status(400).json({ error: 'Missing fileUrl or filePath query parameter' });
    }

    console.log('🧹 Deleting file from S3:', resolvedFilePath);

    // Actual S3 deletion (this must be defined elsewhere)
    await deleteFile(resolvedFilePath); // assumes AWS SDK deleteObject is used internally

    return res.status(200).json({ message: 'File deleted successfully from S3' });
  } catch (error) {
    console.error('❌ Error deleting file from S3:', error.message);
    return res.status(500).json({ error: 'Failed to delete file from S3: ' + error.message });
  }
},






// controllers/deleteFileMetadata.js
deleteFileMetadata: async (req, res) => {
  try {
    const { id } = req.params;
    const { field, collection = 'project', fileId, index, extraField } = req.query;

    console.log('🧪 DELETE METADATA API CALLED');
    console.log('➡️ Collection:', collection);
    console.log('➡️ ID:', id);
    console.log('➡️ Field:', field);
    console.log('➡️ fileId:', fileId);
    console.log('➡️ index:', index);
    console.log('➡️ extraField:', extraField); // ✅ New log

    if (!id || !field) {
      return res.status(400).json({ error: 'Missing id or field' });
    }

    const Model = modelMap[collection];
    if (!Model) {
      return res.status(400).json({ error: `Unknown collection: ${collection}` });
    }

    const doc = await Model.findById(id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // ✅ 1. Remove by array index
    if (typeof index !== 'undefined') {
      const fieldArray = doc[field];
      const idx = parseInt(index);

      if (!Array.isArray(fieldArray)) {
        return res.status(400).json({ error: `${field} is not an array` });
      }

      if (isNaN(idx) || idx < 0 || idx >= fieldArray.length) {
        return res.status(400).json({ error: 'Invalid index' });
      }

      const removed = fieldArray.splice(idx, 1);
      await doc.save();

      return res.status(200).json({
        message: 'Item removed from array by index',
        removed,
        updated: doc,
      });
    }

    // ✅ 2. Remove by fileId from array of objects
    if (fileId) {
      const update = { $pull: { [field]: { _id: fileId } } };

      const updated = await Model.findByIdAndUpdate(id, update, { new: true });
      if (!updated) {
        return res.status(404).json({ error: 'Document not found after update' });
      }

      return res.status(200).json({
        message: 'Item removed from array by fileId',
        updated,
      });
    }

    // ✅ 3. Skip $unset if field is an array (protect array fields)
    const currentValue = doc[field];
    if (Array.isArray(currentValue)) {
      return res.status(400).json({
        error: `Refusing to unset entire array field '${field}'. Provide fileId or index.`,
      });
    }

    // ✅ 4. Unset simple scalar field + optional extraField
    const unsetFields = { [field]: '' };
    if (extraField) {
      unsetFields[extraField] = '';
    }

    const updated = await Model.findByIdAndUpdate(
      id,
      { $unset: unsetFields },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Document not found after unset' });
    }

    return res.status(200).json({
      message: 'Simple field(s) unset',
      updated,
    });
  } catch (error) {
    console.error('❌ Metadata delete error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
},


  // Handle file upload
  uploadProjectFile: upload.single('projectFile'),

  // Fetch only specifications info by project ID
  getSpecificationsInfo: async (req, res) => {
    const { id: projectId } = req.params;

    try {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      const projectForm = await ProjectForm.findOne({ projectInfo: projectId }).select('specificationsInfo');

      if (!projectForm || !projectForm.specificationsInfo) {
        return res.status(404).json({ error: 'Specifications info not found' });
      }

      res.json(projectForm.specificationsInfo);
    } catch (error) {
      console.error('Error fetching specifications info:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all projects with form data
  getAllProjectsWithFormData: async (req, res) => {
    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({ error: 'Missing userId or role in request query' });
    }

    try {
      let projects;
      if (role === 'Seller') {
        projects = await ProjectInfo.find({ userId });
      } else if (role === 'Buyer' || role === 'Admin') {
        projects = await ProjectInfo.find({});
      } else {
        return res.status(400).json({ error: 'Invalid user role' });
      }

      if (!projects || projects.length === 0) {
        return res.status(404).json({ error: 'No projects found for the given criteria' });
      }

      const projectIds = projects.map(p => p._id);
      const projectForms = await ProjectForm.find({ projectInfo: { $in: projectIds } });

      const populatedProjects = await Promise.all(
        projects.map(async project => {
          const form = projectForms.find(f => f.projectInfo.toString() === project._id.toString()) || {};
          const populatedForm = {
            ...form,
            specificationsInfo: await SpecificationsInfo.findById(form.specificationsInfo),
            creditsInfo: await CreditsInfo.findById(form.creditsInfo),
            rightsInfo: await RightsInfoGroup.find({ _id: { $in: form.rightsInfoGroup } }),
          };

          return {
            ...project.toObject(),
            formData: populatedForm,
          };
        })
      );

      res.json({
        message: 'Projects, forms, and related data combined successfully',
        projects: populatedProjects,
      });
    } catch (error) {
      console.error('Error fetching or merging data:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

export default projectFormDataController;
