import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  name: String,
  orgName: String,
  email: {
    type: String,
    unique: true,
    required: true
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
});


export const User = mongoose.model('User', UserSchema);