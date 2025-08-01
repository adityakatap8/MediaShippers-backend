import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  deals: [
    {
      dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
      addedAt: { type: Date, default: Date.now }
    }
  ]
});

export const Cart = mongoose.model('Cart', cartSchema);
