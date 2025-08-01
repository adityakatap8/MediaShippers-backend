import {Cart} from '../models/Cart.js'
import Deal from '../models/Deal.js';
import ProjectInfo from '../models/projectFormModels/FormModels/ProjectInfoSchema.js';

export const getCart = async (req, res) => {
  const { userId } = req.params; // Extract userId from request parameters

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Fetch the cart for the user
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.deals.length === 0) {
      return res.status(404).json({ message: 'No deals found in the cart' });
    }

    console.log('Cart:', cart);

    // Fetch all deal details using dealId references
    const dealIds = cart.deals.map(deal => deal.dealId);
    const deals = await Deal.find({ _id: { $in: dealIds } }).populate('movies.movieId'); // Populate movie details

    console.log('Deals:', deals);

    res.json({
      message: 'Deals fetched successfully',
      deals,
    });
  } catch (err) {
    console.error('Error fetching cart deals:', err);
    res.status(500).json({ error: 'Failed to fetch cart deals' });
  }
};



export const addToCart = async (req, res) => {
  const { userId, dealId, movies, status } = req.body; // Expecting userId, dealId, movies, and status
  console.log('Request Body:', movies, status);
  if (!userId || !dealId || !Array.isArray(movies) || movies.length === 0 || !status) {
    return res.status(400).json({ message: 'userId, dealId, movies array, and status are required' });
  }

  try {
    // 1. Update the Deal with the new movies and status
    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Replace the movies in the deal with the new movies
    deal.movies = movies.map(m => ({
      movieId: m,
    }));

    // Update the status of the deal
    deal.status = status;

    await deal.save();

    // 2. Update the Cart: add dealId to cart if not already present
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = new Cart({
        userId,
        deals: [{ dealId }],
      });
    } else {
      const alreadyInCart = cart.deals.find(d => d.dealId.toString() === dealId);
      if (!alreadyInCart) {
        cart.deals.push({ dealId });
      }
    }

    await cart.save();

    const cartDealsCount = cart.deals;

    console.log('Cart after update:', cartDealsCount);

    return res.status(200).json({
      message: `Deal "${deal.requirementTitle}" updated successfully with ${movies.length} movie(s) and status "${status}".`,
      deal,
      cart,
      cartMovies: cartDealsCount,
    });
  } catch (err) {
    console.error('Error updating deal and cart:', err);
    res.status(500).json({ error: 'Failed to update deal and cart' });
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
