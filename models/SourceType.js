// models/sourceDataType.js

import mongoose from "mongoose";
import metadataSchema from "./MetadatSchema.js";

const sourceTypeSchema = new mongoose.Schema({
  
  url: { type: String },
  awsS3Config: {
    key: { type: String },
    secret: { type: String },
    path: { type: String },
    region: { type: String }
  },
  gcpConfig: {
    key: { type: String },
    secret: { type: String },
    path: { type: String },
    region: { type: String }
  },
  azureConfig: {
    key: { type: String },
    secret: { type: String },
    path: { type: String },
    region: { type: String }
  },
  fileUploadConfig: {
    fileName: { type: String },
    // allowedExtensions: { type: Array, default: ['.mp4', '.avi', '.mov', '.jpg', '.png'] } 
  },
  metadata:metadataSchema
 }, { timestamps: true });

const SourceType = mongoose.model('SourceType', sourceTypeSchema);
export default SourceType;
