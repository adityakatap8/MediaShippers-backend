
import express from 'express';
import mongoose from 'mongoose';
import ProjectForm from '../models/projectFormModels/ProjectForm.js';

const projectFormRouter = express.Router();

// Import existing controllers
import projectFormController from '../controller/projectsFormController.js';

// Add the new controller
import projectViewController from '../controller/projectViewController.js';
import projectFormDataController from '../controller/projectFormDataController.js';

// Define routes
projectFormRouter.post('/', projectFormController.createProject);
// projectFormRouter.get('/', projectFormController.getAllProjects);
projectFormRouter.get('/:id', projectFormController.getUserProjects);

projectFormRouter.get('/:id', projectFormController.getProjectById);
projectFormRouter.put('/:id', projectFormController.updateProject);
projectFormRouter.delete('/:id', projectFormController.deleteProject);

// Add the new route for viewing a project form
projectFormRouter.get('/view/:id', projectViewController.getProjectViewById);

projectFormRouter.get('/data/:id', projectFormDataController.getProjectFormData);
// projectFormRouter.get('/update/:id', projectFormDataController.updateProjectFormData);
// projectFormRouter.put('/update/:id/:section', projectFormDataController.updateProjectFormData);
projectFormRouter.put('/update/:id/:section', projectFormDataController.updateProjectFormData);

projectFormRouter.get("/projects/:projectInfoId", projectViewController.getProjectViewById);

// Add the route to get specifications info
projectFormRouter.get('/specifications/:id', projectFormDataController.getSpecificationsInfo);


// project info routes
// projectFormRouter.post('/create-projectInfo', createProjectInfo)



export default projectFormRouter;
