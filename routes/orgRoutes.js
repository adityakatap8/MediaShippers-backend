import express from 'express';
import { registerOrganizationWithUser } from '../controller/orgController.js';

const router = express.Router();

// Register organization and create admin user
router.post('/register', registerOrganizationWithUser);

export default router; 