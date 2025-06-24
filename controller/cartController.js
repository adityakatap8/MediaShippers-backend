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
    if (!cart) {
      // Create a new cart and save it immediately
      cart = new Cart({ userId, movies });
      await cart.save(); // Save the newly created cart

      // Fetch the updated cart
      const updatedCart = await Cart.findOne({ userId });

      return res.status(201).json({
        message: `Movies added to your cart successfully: ${movies.map(m => `"${m.title}"`).join(', ')}.`,
        cartMovies: updatedCart.movies, // Return the latest cart data
      });
    }

    const existingMovieIds = cart.movies.map(m => m.movieId);

    const alreadyInCart = movies.filter(m => existingMovieIds.includes(m.movieId));
    const newMovies = movies.filter(m => !existingMovieIds.includes(m.movieId));

    let message;
    if (newMovies.length === 0) {
      message = `All selected movies are already in your cart: ${alreadyInCart.map(m => `"${m.title}"`).join(', ')}.`;

      // Fetch the updated cart
      const updatedCart = await Cart.findOne({ userId });

      return res.status(409).json({ message, cartMovies: updatedCart.movies }); // Conflict status code for no new movies added
    } else if (alreadyInCart.length === 0) {
      message = `Movies added to your cart successfully: ${newMovies.map(m => `"${m.title}"`).join(', ')}.`;

      // Add new movies and save the cart
      cart.movies.push(...newMovies);
      await cart.save();

      // Fetch the updated cart
      const updatedCart = await Cart.findOne({ userId });

      return res.status(201).json({ message, cartMovies: updatedCart.movies }); // Created status code for all new movies added
    } else {
      message = `Movies added to your cart: ${newMovies.map(m => `"${m.title}"`).join(', ')}.\nAlready in cart: ${alreadyInCart.map(m => `"${m.title}"`).join(', ')}.`;

      // Add new movies and save the cart
      cart.movies.push(...newMovies);
      await cart.save();

      // Fetch the updated cart
      const updatedCart = await Cart.findOne({ userId });

      return res.status(200).json({ message, cartMovies: updatedCart.movies }); // OK status code for partial addition
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to add movies' }); // Internal Server Error for unexpected issues
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
