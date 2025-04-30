import mongoose from 'mongoose';

const projectInfoSchema = new mongoose.Schema({
  projectTitle: {
    type: String,
    required: true
  },
  projectName: { 
    type: String,
  },
  briefSynopsis: {
    type: String,
  },
  website: {
    type: String,
  },
  email: {
    type: String,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/  // Email validation
  },
  posterFileName: {
    type: String,  // Ensures that posterFileName is stored as a string
    required: false
  },
  bannerFileName: {
    type: String,  // Ensures that bannerFileName is stored as a string
    required: false
  },
  trailerFileName: {
    type: String,  // Ensures that trailerFileName is stored as a string
    required: false
  },
  movieFileName: {
    type: String,  // Ensures that movieFileName is stored as a string
    required: false
  },
  s3SourceTrailerUrl: {
    type: String,  // Ensures that trailer URL is stored as a string
    required: false
  },
  srtFileName: { 
    type: String,  // Ensures that SRT file name is stored as a string
    required: false
  },
  infoDocFileName: { 
    type: [String],  // Updated to specify array of strings (file names)
    required: false
  },
  userId: {
    type: String,  // This is the user reference
    ref: 'UserId',
    required: true
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

const ProjectInfo = mongoose.model('ProjectInfo', projectInfoSchema);

export default ProjectInfo;
