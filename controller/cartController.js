import {Cart} from '../models/Cart.js'
import ProjectInfo from '../models/projectFormModels/FormModels/ProjectInfoSchema.js';

export const getCart = async (req, res) => {
  const { userId } = req.params; // Extract userId from request parameters

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const cart = await Cart.findOne({ userId });
    const projectDetails = await ProjectInfo.find({
      _id: { $in: cart.movies.map(movie => movie.movieId) }
    });
    console.log('Project Details:', projectDetails);

    res.json(projectDetails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

export const addToCart = async (req, res) => {
  const { userId, movies } = req.body; // expecting an array of movie objects

  if (!Array.isArray(movies) || movies.length === 0) {
    return res.status(400).json({ message: 'Movies array is required' });
  }

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, movies: [] });

    const existingMovieIds = cart.movies.map(m => m.movieId);

    const newMovies = movies.filter(m => !existingMovieIds.includes(m.movieId));

    if (newMovies.length === 0) {
      return res.status(409).json({ message: 'All movies already exist in cart' });
    }

    cart.movies.push(...newMovies);
    await cart.save();

    res.json(cart.movies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add movies' });
  }
};


export const deleteCartMovie = async (req, res) => {
  const { userId, cartItemId } = req.params; // Extract userId and cartItemId from request parameters

  if (!userId || !cartItemId) {
    return res.status(400).json({ message: 'User ID and Cart Item ID are required' });
  }

  try {
    const result = await Cart.updateOne(
      { userId }, // Match the cart by userId
      { $pull: { movies: { movieId: cartItemId } } } // Remove the movie with the matching _id
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart item removed successfully' });
  } catch (err) {
    console.error('Error clearing cart item:', err);
    res.status(500).json({ error: 'Failed to clear cart item' });
  }
};
