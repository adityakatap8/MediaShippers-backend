import mongoose from 'mongoose';
import ProjectFormViewerService from '../services/projectFormViewerService.js';
import multer from 'multer';
import jwt from 'jsonwebtoken';

// Mongoose models
import ProjectForm from '../models/projectFormModels/ProjectForm.js';
import ProjectInfo from '../models/projectFormModels/FormModels/ProjectInfoSchema.js';

import CreditsInfo from '../models/projectFormModels/FormModels/CreditsInfoSchema.js';
import SpecificationsInfo from '../models/projectFormModels/FormModels/SpecificationsInfo.js';
import RightsInfoGroup from '../models/projectFormModels/FormModels/RightsInfoSchema.js'; // ✅ Correct




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

    // Correctly find the ProjectForm where projectInfo matches the _id
    const projectForm = await ProjectForm.findOne({ projectInfo: objectId });

    if (!projectForm) {
      return res.status(404).json({ error: 'Project form not found' });
    }

    // Populate all related documents
    const [
      projectInfo,
      creditsInfo,
      specificationsInfo,
      rightsInfo,
    ] = await Promise.all([
      ProjectInfo.findById(projectForm.projectInfo),
      CreditsInfo.findById(projectForm.creditsInfo),
      SpecificationsInfo.findById(projectForm.specificationsInfo),
      RightsInfoGroup.findById(projectForm.rightsInfo?.[0]), // In case rightsInfo is an array
    ]);

    const responseData = {
      ...projectForm.toObject(),
      projectInfo,
      creditsInfo,
      specificationsInfo,
      rightsInfo,
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching project data:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}
,


  // Update project form data
  updateProjectFormData: async (req, res) => {
    const { id: projectId, section } = req.params;
    const updateData = req.body;

    try {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID format' });
      }

      if (!section || typeof section !== 'string') {
        return res.status(400).json({ error: 'Invalid section identifier' });
      }

      const sectionMappings = {
        projectInfo: 'projectInfo',
        
        creditsInfo: 'creditsInfo',
        specificationsInfo: 'specificationsInfo',
        screeningsInfo: 'screeningsInfo',
      };

      if (!sectionMappings[section]) {
        return res.status(400).json({ error: 'Invalid section name' });
      }

      const updateField = sectionMappings[section];
      const updateResult = await ProjectForm.updateOne(
        { projectInfo: projectId },
        { $set: { [updateField]: updateData } }
      );

      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json({ message: `${section} updated successfully` });
    } catch (error) {
      console.error('Error updating project data:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

deleteProject: async (req, res) => {
  const { id: projectId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID format' });
    }

    const deleteResult = await ProjectInfo.deleteOne({ _id: projectId });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error.message);
    res.status(500).json({ error: 'Internal server error' });
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
