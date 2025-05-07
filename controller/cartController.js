import {Cart} from '../models/Cart.js'

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    res.json(cart?.movies || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

export const addToCart = async (req, res) => {
  const { movie } = req.body;

  try {
    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) cart = new Cart({ userId: req.user._id, movies: [] });

    const exists = cart.movies.find(m => m.movieId === movie.movieId);
    if (exists) return res.status(409).json({ message: 'Movie already in cart' });

    cart.movies.push(movie);
    await cart.save();
    res.json(cart.movies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add movie' });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.deleteOne({ userId: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};
