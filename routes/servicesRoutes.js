import express from 'express';
import {
    createService,
    getServiceById,
    updateService,
    deleteService
} from '../controller/servicesController.js';

const router = express.Router();

// POST request to create a new service
router.post('/', createService);

// GET request to fetch a service by ID
router.get('/:id', getServiceById);

// PUT request to update a service by ID
router.put('/:id', updateService);

// DELETE request to delete a service by ID
router.delete('/:id', deleteService);

export default router;
