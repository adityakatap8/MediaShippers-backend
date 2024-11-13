import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: String,
    orgName: String,
    email: { type: String, unique: true },
    passwordHash: String,
    userId: String,
    createdAt: String,
    updatedAt: Date,
    _id: false 
});

export const User = mongoose.model('User', UserSchema);
