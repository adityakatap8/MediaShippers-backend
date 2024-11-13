// controllers/orderTypeController.js
import OrderTypeService from "../services/orderTypeService.js";

const orderTypeController = {
  createOrderType: async (req, res) => {
    try {
      const { type, userId, userEmail } = req.body;
      
      if (!['on-demand', 'watch-folder', 'video-catalogue'].includes(type)) {
        return res.status(400).json({ error: 'Invalid type. Must be either "on-demand" or "watch-folder" or "video-catalogue' });
      }

      const newOrderType = await OrderTypeService.createOrderType(type, userId, userEmail);
      res.status(201).json(newOrderType);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getAllOrderTypes: async (req, res) => {
    try {
      const orderTypes = await OrderTypeService.getAllOrderTypes();
      res.json(orderTypes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getOrderTypeById: async (req, res) => {
    try {
      const { id } = req.params;
      const orderType = await OrderTypeService.getOrderTypeById(id);
      if (!orderType) {
        return res.status(404).json({ error: 'OrderType not found' });
      }
      res.json(orderType);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateOrderType: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedOrderType = await OrderTypeService.updateOrderType(id, req.body);
      res.json(updatedOrderType);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteOrderType: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedOrderType = await OrderTypeService.deleteOrderType(id);
      if (!deletedOrderType) {
        return res.status(404).json({ error: 'OrderType not found' });
      }
      res.json({ message: 'OrderType deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export default orderTypeController;
