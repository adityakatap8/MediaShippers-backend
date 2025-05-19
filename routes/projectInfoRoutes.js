// routes/projectRoutes.js

import express from 'express';
import {
  createProjectInfo,
  getProjectInfoByProjectName,
  updateProjectInfo,
  deleteProjectInfo,
  getProjectsByUserId
} from '../controller/projectInfoController.js';

const projectInfoRoutes = express.Router();

// Route to create project info
projectInfoRoutes.post('/createProjectInfo', createProjectInfo);

// Route to get project info by projectId
projectInfoRoutes.get('/:userId', getProjectInfoByProjectName);

// Route to update project info by projectId
projectInfoRoutes.patch('/:projectName', updateProjectInfo);

// route to get the projects from the projectInfo collection by using UserId
projectInfoRoutes.get('/userProjects/:userId', getProjectsByUserId);


// Route to delete project info by projectId
projectInfoRoutes.delete('/:projectId', deleteProjectInfo);

export default projectInfoRoutes;
