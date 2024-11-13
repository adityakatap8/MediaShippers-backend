// Import express
import express from 'express';

// Create a new router instance
const orderTypeRouter = express.Router();

// Import OrderTypeController
import orderTypeController from '../controller/orderTypeController.js'

// Define routes
orderTypeRouter.post('/', orderTypeController.createOrderType);
orderTypeRouter.get('/', orderTypeController.getAllOrderTypes);
orderTypeRouter.get('/:id', orderTypeController.getOrderTypeById); 
orderTypeRouter.put('/:id', orderTypeController.updateOrderType);
orderTypeRouter.delete('/:id', orderTypeController.deleteOrderType);



// Export the router
export default orderTypeRouter;
