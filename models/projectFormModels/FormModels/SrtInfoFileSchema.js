// models/projectFormModels/FormModels/SrtInfoFileSchema.js

import mongoose from 'mongoose';

const FileMetaSchema = new mongoose.Schema({
  fileName: { type: String},
  fileUrl: { type: String}
});

const SrtInfoFileSetSchema = new mongoose.Schema({
  userId: { type: String},
  orgName: { type: String },
  projectName: { type: String },
  srtFiles: [FileMetaSchema],
  infoDocuments: [FileMetaSchema]
});

export default mongoose.model('SrtInfoFileSet', SrtInfoFileSetSchema);
