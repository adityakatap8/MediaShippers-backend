import mongoose from 'mongoose';

const submitterInfoSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/,
    trim: true
  },
  contactNumber: {
    type: String,
    
    trim: true
  },
  address: {
    type: String,
    
    trim: true
  },
  city: {
    type: String,
    
    trim: true
  },
  state: {
    type: String,
   
    trim: true
  },
  postalCode: {
    type: String,
    
    trim: true
  },
  country: {
    type: String,
    
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    
  }
}, {
  timestamps: true
});

const SubmitterInfo = mongoose.model('SubmitterInfo', submitterInfoSchema);

export default SubmitterInfo;
