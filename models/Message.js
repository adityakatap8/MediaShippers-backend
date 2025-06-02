import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String },
  read: { type: Boolean, default: false }, // Track if the message has been read
  timestamp: { type: Date, default: Date.now },
  visibleTo: { type: [String], default: [] } // Array of roles that can view the message (e.g., ['admin', 'buyer', 'seller'])
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
