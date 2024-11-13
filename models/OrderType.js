// models/orderTypeSchema.js

import mongoose from "mongoose";

const orderTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['on-demand', 'watch-folder','video-catalogue' ],
    required: true
  },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const OrderType = mongoose.model('OrderType', orderTypeSchema);
export default OrderType;
