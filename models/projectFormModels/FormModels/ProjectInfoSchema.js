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
  twitter: {
    type: String,
  },
  facebook: {
    type: String,
  },
  instagram: {
    type: String,
  },
  posterFileName: {
    type: String, // Adjusted to match response field
    required: false
  },
  bannerFileName: {
    type: String, // Adjusted to match response field
    required: false
  },
  trailerFileName: {
    type: String, // Adjusted to match response field
    required: false
  },
  movieFileName: {
    type: String, // Adjusted to match response field
    required: false
  },
  // s3SourceBannerUrl: {
  //   type: String, // Adjusted to match response field
  //   required: false
  // },
  // s3SourceMovieUrl: {
  //   type: String, // Adjusted to match response field
  //   required: false
  // },
  // s3SourcePosterUrl: {
  //   type: String, // Adjusted to match response field
  //   required: false
  // },
  s3SourceTrailerUrl: {
    type: String, // Adjusted to match response field
    required: false
  },
  srtFileName: { 
    type: String, // Added field to store the SRT file name
    required: false
  },
  infoDocFileName: { 
    type: Array, // Added field to store the Info Document file name
    required: false
  },
  userId: {
    type: String, // This is the user reference
    ref: 'UserId',
    required: true
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

const ProjectInfo = mongoose.model('ProjectInfo', projectInfoSchema);

export default ProjectInfo;
