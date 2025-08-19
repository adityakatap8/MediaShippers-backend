import express from 'express';
import { getAllOrganizations, registerOrganizationWithUser } from '../controller/orgController.js';
import { get } from 'mongoose';

const router = express.Router();

// Register organization and create admin user
router.post('/register', registerOrganizationWithUser);

router.get('/get-org', getAllOrganizations);

export default router; 