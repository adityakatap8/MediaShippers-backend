import express from 'express';
const projectFormRouter = express.Router();

import projectFormController from '../controller/projectsFormController.js';

// Define routes
projectFormRouter.post('/', projectFormController.createProject); // Create a new project
projectFormRouter.get('/', projectFormController.getAllProjects); // Get all projects
// projectFormRouter.get('/forms', projectFormController.getProjectForms); // New route: Get all project forms with their IDs
projectFormRouter.get('/:id', projectFormController.getProjectById); // Get a project by ID
projectFormRouter.put('/:id', projectFormController.updateProject); // Update a project
projectFormRouter.delete('/:id', projectFormController.deleteProject); // Delete a project

// projectFormRouter.get('/form/:projectId', projectFormController.getProjectFormByProjectId);

export default projectFormRouter;
