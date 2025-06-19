import mongoose from 'mongoose';
import ProjectFormViewerService from '../services/projectFormViewerService.js';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { deleteFolder } from '../services/s3Service.js'

// Mongoose models
import ProjectForm from '../models/projectFormModels/ProjectForm.js';
import ProjectInfo from '../models/projectFormModels/FormModels/ProjectInfoSchema.js';

import CreditsInfo from '../models/projectFormModels/FormModels/CreditsInfoSchema.js';
import SpecificationsInfo from '../models/projectFormModels/FormModels/SpecificationsInfo.js';
import RightsInfoGroup from '../models/projectFormModels/FormModels/RightsInfoSchema.js';
import SrtInfoFileSchema from '../models/projectFormModels/FormModels/SrtInfoFileSchema.js';




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
      SrtInfoFileSchema.findById(projectInfo.srtFilesId), // ✅ correct reference
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
  // Update project form data
updateMultipleSections: async (req, res) => {
  const { id: projectId } = req.params;
  const updateData = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
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
    };

    const updateResults = {};

    for (const section of Object.keys(sectionsMap)) {
      if (updateData[section]) {
        const { model, id } = sectionsMap[section];
        if (!id) continue;

        const updatedDoc = await model.findByIdAndUpdate(id, updateData[section], { new: true }).exec();
        if (updatedDoc) {
          updateResults[section] = {
            id: updatedDoc._id,
            updatedData: updatedDoc,
          };
        }
      }
    }

    if (Object.keys(updateResults).length === 0) {
      return res.status(400).json({ message: 'No valid sections to update or invalid IDs.' });
    }

    res.json({
      message: 'Project and related sections updated successfully',
      updates: updateResults,
    });

  } catch (error) {
    console.error('Error updating project and sections:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

,


// deleteProject: async (req, res) => {
//   const { id: projectId } = req.params;

//   try {
//     if (!mongoose.Types.ObjectId.isValid(projectId)) {
//       return res.status(400).json({ error: 'Invalid project ID format' });
//     }

//     const deleteResult = await ProjectInfo.deleteOne({ _id: projectId });

//     if (deleteResult.deletedCount === 0) {
//       return res.status(404).json({ error: 'Project not found' });
//     }

//     res.json({ message: 'Project deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting project:', error.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// },


deleteProject : async (req, res) => {
  const { id: projectId } = req.params;
  const { orgName, projectName } = req.body; // 👈 Grab from body

  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    // Delete project document from MongoDB
    const deleteResult = await ProjectInfo.deleteOne({ _id: projectId });
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ error: 'Project not found for deletion' });
    }

    // Log and delete S3 folder
    const folderPath = `${orgName}/${projectName}/`;
    console.log(`🗂️ S3 folder path to delete: ${folderPath}`);

    try {
      await deleteFolder(folderPath); // from your s3 service
      console.log(`✅ S3 folder deleted: ${folderPath}`);
    } catch (s3Error) {
      console.error(`❌ Failed to delete S3 folder: ${s3Error.message}`);
    }

    return res.status(200).json({ message: 'Project and associated S3 folder deleted successfully.' });

  } catch (error) {
    console.error('Error deleting project:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
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
