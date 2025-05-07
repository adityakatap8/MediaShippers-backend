import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movies: [
    {
      movieId: String,
      title: String,
      year: Number,
      image: String
    }
  ]
});

export const Cart = mongoose.model('Cart', cartSchema);
