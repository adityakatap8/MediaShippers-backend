// models/Job.js
import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  jobDetails: Object,
  status: { type: String, enum: ['pending', 'inProgress', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Job = mongoose.model('Job', JobSchema);
