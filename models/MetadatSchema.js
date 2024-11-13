// models/metadataSchema.js

import mongoose from "mongoose";

const metadataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: {
    type: String,
    enum: ['action', 'comedy', 'drama', 'thriller'],
    required: true
  },
  category: {
    type: String,
    enum: ['movie', 'series', 'documentary'],
    required: true
  },
  language: {
    type: String,
    enum: ['English', 'Hindi', 'Spanish', 'French'],
    required: true
  },
  subtitleClosedCaptions: [{ type: String }],
  auxiliaryFiles: [{ type: String }],
  audio: { type: String },
});

export default metadataSchema;
