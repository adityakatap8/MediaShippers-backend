import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String,
  orgName: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  organizationId: {
    type: String,
    ref: 'Organization'
  },
  role: {
    type: String,
    enum: ['Admin', 'Seller', 'Buyer'],
    default: 'Buyer',
    required: true
  },
  passwordHash: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  tokenExpiresAt: Date,
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  companySite: String,
  phoneNumber: Number
});


export const User = mongoose.model('User', UserSchema);