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
    unique: true
  },
  passwordHash: String,
  createdAt: String,
  updatedAt: Date,
});

// Add virtual userId field that references _id
UserSchema.virtual('userId').get(function() {
  return this._id;
});

// Configure schema options
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Make _id available as id in output
    ret.id = ret._id;
    return ret;
  }
});

export const User = mongoose.model('User', UserSchema);