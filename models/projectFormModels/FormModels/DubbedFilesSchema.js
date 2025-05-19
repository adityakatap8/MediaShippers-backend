import mongoose from 'mongoose';

const singleDubbedFileSchema = new mongoose.Schema({
  dubbedTrailerFileName: { type: String },
  dubbedTrailerUrl: { type: String },       // Optional S3 URL
  dubbedSubtitleFileName: { type: String },
  language: { type: String, required: true }, // Language field added
}, { _id: false }); // _id disabled for embedded documents

const dubbedFilesSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectInfo',
    required: true,
  },
  dubbedFiles: [singleDubbedFileSchema],
}, {
  timestamps: true,
});

const DubbedFiles = mongoose.model('DubbedFiles', dubbedFilesSchema);
export default DubbedFiles;
