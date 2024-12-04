import express from 'express';
import destinationController from '../controller/destinationController.js';

const router = express.Router();

// Route to create a new destination
router.post('/', destinationController.createDestination);

// Route to get all destinations
router.get('/', destinationController.getAllDestinations);

// Route to get a destination by ID
router.get('/:id', destinationController.getDestinationById);

// Route to delete a destination by ID
router.delete('/:id', destinationController.deleteDestination);

export default router;
