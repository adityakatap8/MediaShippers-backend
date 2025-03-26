import mongoose from 'mongoose';

// Schema for individual screenings
const screeningSchema = new mongoose.Schema({
  filmFestival: {
    type: String,
  },
});

// Schema for individual distributors
const distributorSchema = new mongoose.Schema({
  distributor: {
    type: String,
  },
});

// Main schema for ScreeningsInfo
const screeningsInfoSchema = new mongoose.Schema(
  {
    screenings: [screeningSchema], // Array of screenings
    distributors: [distributorSchema], // Array of distributors
  },
  {
    timestamps: true, // Add createdAt and updatedAt timestamps
  }
);

const ScreeningsInfo = mongoose.model('ScreeningsInfo', screeningsInfoSchema, 'screeninginfos');

export default ScreeningsInfo;
