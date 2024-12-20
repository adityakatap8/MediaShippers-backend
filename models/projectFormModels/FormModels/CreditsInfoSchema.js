import mongoose from 'mongoose';

const creditsInfoSchema = new mongoose.Schema({
  directors: [{
    firstName: {
      type: String
    },
    lastName: {
      type: String
    }
  }],
  writers: [{
    firstName: {
      type: String
    },
    lastName: {
      type: String
    }
  }],
  producers: [{
    firstName: {
      type: String
    },
    lastName: {
      type: String
    }
  }]
}, {
  timestamps: true
});

const CreditsInfo = mongoose.model('CreditsInfo', creditsInfoSchema);

export default CreditsInfo;
