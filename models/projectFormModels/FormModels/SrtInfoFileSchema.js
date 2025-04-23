import mongoose from 'mongoose';

// Reusable file metadata schema
const fileMetaSchema = new mongoose.Schema({
  fileName: { type: String },
  filePath: { type: String },
  fileType: { type: String },
  fileSize: { type: Number },
}, { _id: false }); // Prevents Mongoose from creating extra _id for nested object

const SrtInfoFileSetSchema = new mongoose.Schema({
  srtFiles: [fileMetaSchema],  // Array of srtFile objects
  infoDocFiles: [fileMetaSchema],  // Array of infoDocFile objects
  userId: {
    type: String,
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  orgName: {
    type: String,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt automatically
});

export default mongoose.model('SrtInfoFileSet', SrtInfoFileSetSchema);
