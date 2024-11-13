// Import express
import express from 'express';

// Create a new router instance
const sourceTypeRouter = express.Router();

// Import SourceTypeController
import sourceTypeController from '../controller/sourceTypeController.js'

// Define routes
sourceTypeRouter.get('/', sourceTypeController.getSourceTypes);
sourceTypeRouter.get('/:id', sourceTypeController.getSourceTypeById);
sourceTypeRouter.post('/', sourceTypeController.createSourceType);
sourceTypeRouter.put('/:id', sourceTypeController.updateSourceType);
sourceTypeRouter.delete('/:id', sourceTypeController.deleteSourceType);

// Export the router
export default sourceTypeRouter;
