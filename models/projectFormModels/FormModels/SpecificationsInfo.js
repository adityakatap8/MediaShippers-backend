import mongoose from 'mongoose';

const specificationsInfoSchema = new mongoose.Schema({
    projectType: {
      type: String,
      
    },
    genres: {
      type: String,
      
    },
    runTime: {
      hours: Number,
      minutes: Number,
      seconds: Number
    },
    completionDate: {
      type: Date,
     
    },
    productionBudget: {
      type: Number,
      
    },
    currency: {
      type: String,
      
    },
    countryOfOrigin: {
      type: String,
      
    },
    countryOfFilming: {
      type: String,
      
    },
    language: {
      type: String,
     
    },
    shootingFormat: {
      type: String,
      
    },
    aspectRatio: {
      type: String,
      
    },
    filmColor: {
      type: String,
      
    },
    studentProject: {
      type: String,
      
    },
    firstTimeFilmmaker: {
      type: String,
      
    },
    resolution: {
      type: String,
      
    },
    format: {
      type: String,
     
    },
    duration: {
      type: String,
      
    }
  }, { timestamps: true });
  

const SpecificationsInfo = mongoose.model('SpecificationsInfo', specificationsInfoSchema);

export default SpecificationsInfo;
