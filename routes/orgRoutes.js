import express from 'express';
import { getAllOrganizations, registerOrganizationWithUser, updateOrganizationWithUser } from '../controller/orgController.js';


const router = express.Router();

// Register organization and create admin user
router.post('/register', registerOrganizationWithUser);

router.get('/get-org', getAllOrganizations);

router.put('/update-org/:id', updateOrganizationWithUser)

export default router; 