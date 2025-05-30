import mongoose from 'mongoose';

// 🔽 Define the embedded schema for each dubbed file
const dubbedFileSchema = new mongoose.Schema(
  {
    language: { type: String, required: true },
    dubbedTrailerFileName: { type: String },
    dubbedTrailerUrl: { type: String }, // S3 URL
    dubbedSubtitleFileName: { type: String },
    dubbedSubtitleUrl: { type: String } // S3 URL
  },
  { _id: false }
);

const projectInfoSchema = new mongoose.Schema({
  projectTitle: { type: String, required: true },
  projectName: { type: String },
  briefSynopsis: { type: String },
  website: { type: String },
  email: {
    type: String,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/,
  },
  posterFileName: { type: String },
  bannerFileName: { type: String },
  trailerFileName: { type: String },
  movieFileName: { type: String },
  s3SourceTrailerUrl: { type: String },
  srtFileName: { type: String },
  infoDocFileName: { type: [String] },
  userId: { type: String, required: true },
  isPublic: {
    type: String,
    enum: ['public', 'private'],
    default: 'private',
  },

  // 🔽 Embed dubbed file data here
  dubbedFileData: [dubbedFileSchema],

  // ✅ References to other collections
  creditsInfoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditsInfo',
  },
  specificationsInfoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpecificationsInfo',
  },
  rightsInfoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RightsInfoGroup',
  },
  screeningsInfoIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScreeningsInfo',
    },
  ],
  srtFilesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SrtInfoFile',
  },
}, {
  timestamps: true,
});

const ProjectInfo = mongoose.model('ProjectInfo', projectInfoSchema);

export default ProjectInfo;
