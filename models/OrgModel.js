import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  orgName: {
    type: String,
    required: true,
  },
  orgAddress: {
    type: String,
    required: true,
  },
  orgCorpRegNo: {
    type: String,
    required: true,
  },
  orgGstNo: {
    type: String,
    required: true,
  },
  orgCorpPdf: {
    type: String, // S3 URL or path to file
  },
  orgGstPdf: {
    type: String, // S3 URL or path to file
  },
  orgAgreementPdf: {
    type: String, // S3 URL or path to file
  },
  primaryName: {
    type: String,
    required: true,
  },
  primaryEmail: {
    type: String,
    required: true,
  },
  primaryNo: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const Organization = mongoose.model('Organization', OrganizationSchema);
