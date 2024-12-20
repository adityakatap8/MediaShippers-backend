import mongoose from 'mongoose';

const screeningInfoSchema = new mongoose.Schema({
  screeningDate: {
    type: Date,
  
  },
  screeningLocation: {
    type: String,
   
  },
  screeningTime: {
    type: String,
   
  }
}, {
  timestamps: true
});

const ScreeningInfo = mongoose.model('ScreeningInfo', screeningInfoSchema);

export default ScreeningInfo;
