import mongoose from 'mongoose';

// Define the destination type schema
const destinationTypeSchema = new mongoose.Schema({
  awsS3Config: {
    key: { type: String },
    secret: { type: String },
    path: { type: String },
    region: { type: String },
  },
  gcpConfig: {
    key: { type: String },
    secret: { type: String },
    path: { type: String },
    region: { type: String },
  },
  azureConfig: {
    key: { type: String },
    secret: { type: String },
    path: { type: String },
    region: { type: String },
  },
  email: { type: String, required: true },  // Email to receive download link
}, { timestamps: true });

const Destination = mongoose.model('Destination', destinationTypeSchema);

export default Destination;
