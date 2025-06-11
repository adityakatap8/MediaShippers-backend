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

// ----------------------
// 📌 Form Data + Nested Info
// ----------------------
projectFormRouter.get('/all-details', projectFormDataController.getAllProjectsWithFormData);
projectFormRouter.get('/data/:id', projectFormDataController.getProjectFormData);

projectFormRouter.put('/update/:id/:section', projectFormDataController.updateProjectFormData);
projectFormRouter.delete('/delete/:id', projectFormDataController.deleteProject);

projectFormRouter.get('/specifications/:id', projectFormDataController.getSpecificationsInfo);

// ----------------------
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

