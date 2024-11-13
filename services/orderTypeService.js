// services/orderTypeService.js

import OrderType from '../models/OrderType.js'

class OrderTypeService {
  static async createOrderType(type, userId, userEmail) {
    const newOrderType = new OrderType({
      type,
      userId,
      userEmail
    });

    return newOrderType.save();
  }

  static async getAllOrderTypes() {
    return OrderType.find().exec();
  }

  static async getOrderTypeById(id) {
    return OrderType.findById(id).exec();
  }

  static async updateOrderType(id, updatedFields) {
    return OrderType.findByIdAndUpdate(id, updatedFields, { new: true }).exec();
  }

  static async deleteOrderType(id) {
    return OrderType.findByIdAndDelete(id).exec();
  }
}

export default OrderTypeService;
