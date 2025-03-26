import mongoose from 'mongoose';

const { Schema } = mongoose;

const srtFileSchema = new Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const SrtFile = mongoose.model('SrtFile', srtFileSchema);

export default SrtFile;
