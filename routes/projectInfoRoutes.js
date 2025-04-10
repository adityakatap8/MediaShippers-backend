// routes/projectRoutes.js

import express from 'express';
import {
  createProjectInfo,
  getProjectInfoByProjectName,
  updateProjectInfo,
  deleteProjectInfo
} from '../controller/projectInfoController.js';

const projectInfoRoutes = express.Router();

// Route to create project info
projectInfoRoutes.post('/createProjectInfo', createProjectInfo);

// Route to get project info by projectId
projectInfoRoutes.get('/:userId', getProjectInfoByProjectName);

// Route to update project info by projectId
projectInfoRoutes.patch('/:projectName', updateProjectInfo);



// Route to delete project info by projectId
projectInfoRoutes.delete('/:projectId', deleteProjectInfo);

export default projectInfoRoutes;
