import mongoose from 'mongoose';

const specificationsInfoSchema = new mongoose.Schema({
  projectType: {
    type: String,
  },
  genres: {
    type: [String], 
    default: [],
  },
 runtime: {
  type: String
},
  completionDate: {
    type: Date,
  },

  language: {
    type: String,
  },
  duration: {
    type: String,
  },
  rating: {
    type: String,
  }
}, { timestamps: true });

const SpecificationsInfo = mongoose.model('SpecificationsInfo', specificationsInfoSchema);

export default SpecificationsInfo;
