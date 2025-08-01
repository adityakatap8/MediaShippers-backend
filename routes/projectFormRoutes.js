import express from 'express';
import mongoose from 'mongoose';
import ProjectForm from '../models/projectFormModels/ProjectForm.js';

import projectFormController from '../controller/projectsFormController.js';
import projectViewController from '../controller/projectViewController.js';
import projectFormDataController from '../controller/projectFormDataController.js';

const projectFormRouter = express.Router();

// ----------------------
// 📌 General Project Routes
// ----------------------
projectFormRouter.post('/', projectFormController.createProject);
projectFormRouter.get('/', projectFormController.getAllProjects);
projectFormRouter.post('/bulkCreateProject', projectFormController.bulkCreateProject);

// ----------------------
// 📌 Form Data + Nested Info
// ----------------------
projectFormRouter.get('/all-details', projectFormDataController.getAllProjectsWithFormData);
projectFormRouter.get('/data/:id', projectFormDataController.getProjectFormData);

projectFormRouter.patch('/update/:id', projectFormDataController.updateMultipleSections);

projectFormRouter.delete('/delete/:id', projectFormDataController.deleteProject);

projectFormRouter.delete('/delete-file', projectFormDataController.deleteFileFromS3);

projectFormRouter.delete('/delete-file-metadata/:id', projectFormDataController.deleteFileMetadata);

projectFormRouter.get('/specifications/:id', projectFormDataController.getSpecificationsInfo);

// ----------------------ac
// 📌 View Routes (Non-editable display logic)
// ----------------------
// projectFormRouter.get('/view/:id', projectViewController.getProjectViewById);
projectFormRouter.get('/projects/:projectInfoId', projectViewController.getProjectViewById);

// ----------------------
// 📌 Project-specific routes by ID
// ----------------------
// projectFormRouter.get('/:id', projectFormController.getProjectById); // Fetch project
projectFormRouter.put('/:id', projectFormController.updateProject);  // Update
projectFormRouter.delete('/:id', projectFormController.deleteProject); // Delete

// 🚫 Removed duplicate route for getUserProjects — integrate that logic inside getProjectById if needed.

export default projectFormRouter;

