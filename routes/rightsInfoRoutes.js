import express from 'express';
import {
  createRightsInfo,
  getRightsInfoByUserId,
  updateRightsInfo,
  deleteRightsInfo
} from '../controller/rightsInfoController.js';

const rightsInfoRoutes = express.Router();

// Route to create rights info
rightsInfoRoutes.post('/createRightsInfo', createRightsInfo);

// Route to get rights info by userId
rightsInfoRoutes.get('/:userId', getRightsInfoByUserId);

// Route to update rights info by projectName (or rightsInfoId)
rightsInfoRoutes.patch('/:rightsInfoId', updateRightsInfo);

// Route to delete rights info by projectId
rightsInfoRoutes.delete('/:rightsInfoId', deleteRightsInfo);

export default rightsInfoRoutes;
