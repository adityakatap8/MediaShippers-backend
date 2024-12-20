// Import express
import express from 'express';

// Create a new router instance
const projectFormRouter = express.Router();

// Import ProjectFormController
import projectFormController from '../controller/projectsFormController.js'; // Adjust the path as needed

// Define routes
projectFormRouter.post('/', projectFormController.createProject);  // Create a new project
projectFormRouter.get('/', projectFormController.getAllProjects);  // Get all projects
projectFormRouter.get('/:id', projectFormController.getProjectById);  // Get a project by ID
projectFormRouter.put('/:id', projectFormController.updateProject);  // Update a project
projectFormRouter.delete('/:id', projectFormController.deleteProject);  // Delete a project

// Export the router
export default projectFormRouter;
