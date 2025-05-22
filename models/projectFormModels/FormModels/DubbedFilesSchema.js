import mongoose from 'mongoose';

const singleDubbedFileSchema = new mongoose.Schema(
  {
    dubbedTrailerFileName: { type: String },
    dubbedTrailerUrl: { type: String }, // S3 or blob URL
    dubbedSubtitleFileName: { type: String },
    language: { type: String, required: true },
    localVideoUrl: { type: String }, // Added for UI reference or upload preview
  },
  { _id: false }
);

const dubbedFilesSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true }, // ✅ Changed from projectId
    userId: { type: String, required: true },      // ✅ For linking with the user
    dubbedFiles: [singleDubbedFileSchema],
  },
  {
    timestamps: true,
  }
);

const DubbedFiles = mongoose.model('DubbedFiles', dubbedFilesSchema);
export default DubbedFiles;
