import mongoose from 'mongoose';
import Deal from '../models/Deal.js';
import Message from '../models/Message.js';
import { Cart } from '../models/Cart.js';

export const createDealWithMessage = async (req, res) => {
    const {
        senderId,
        receiverId,
        movies,
        rights,
        territory,
        licenseTerm,
        usageRights,
        paymentTerms,
        status,
        remarks,
        message
    } = req.body;

    console.log("message", message);

    try {
        // Create the deal
        const deal = new Deal({
            senderId,
            assignedTo: receiverId,
            movies,
            rights,
            territory,
            licenseTerm,
            usageRights,
            paymentTerms,
            status: status || 'pending',
            remarks
        });

        const savedDeal = await deal.save();

        // Create the message linked to the deal
        const newMessage = new Message({
            dealId: savedDeal._id,
            senderId: message.senderId,
            receiverId,
            message: message.content
        });

        const savedMessage = await newMessage.save();

        // Update the deal's history with the new message ID
        savedDeal.history.push(savedMessage._id);
        await savedDeal.save();

        console.log('Deal created:', movies);

        // Extract movie IDs as strings
        const movieIds = movies.map(movie => String(movie.movieId));
        console.log('Movie IDs to remove:', movieIds);

        // Remove the submitted movies from the cart
        await Cart.updateOne(
            { userId: senderId }, // Find the cart for the user
            { $pull: { movies: { movieId: { $in: movieIds } } } } // Remove movies by movieId
        );

        // Fetch the updated cart to get the remaining movies
        const updatedCart = await Cart.findOne({ userId: senderId });

        console.log('Updated cart:', updatedCart);

        res.status(201).json({
            message: 'Deal created, initial message added, and movies removed from cart successfully',
            deal: savedDeal,
            initialMessage: savedMessage,
            remainingMovies: updatedCart ? updatedCart.movies : [] // Return remaining movies
        });
    } catch (error) {
        console.error('Error creating deal and message:', error);
        res.status(500).json({ error: 'Failed to create deal and message' });
    }
};


export const addMessageAndUpdateStatus = async (req, res) => {
    const { dealId } = req.params; // Deal ID from the request parameters
    const { senderId, receiverId, message, status } = req.body; // Message details and new status

    try {
        const deal = await Deal.findById(dealId);

        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' });
        }


        // if (status) {
        //     deal.status = status;
        //     await deal.save();
        // }


        const newMessage = new Message({
            dealId,
            senderId,
            receiverId,
            message
        });

        const savedMessage = await newMessage.save();

        res.status(201).json({
            message: 'Message added and deal status updated successfully',
            updatedDeal: deal,
            savedMessage
        });
    } catch (error) {
        console.error('Error adding message and updating status:', error);
        res.status(500).json({ error: 'Failed to add message and update status' });
    }
};

export const getDealsWithCounts = async (req, res) => {
    const { id } = req.params;
    console.log('User ID:', id); // Log the user ID for debugging
    try {
        // Fetch all deals
        const deals = await Deal.find({
            $or: [{ senderId: id }, { assignedTo: id }]
        });

        // Count total deals
        const total = deals.length;

        // Count pending deals
        const pending = deals.filter(deal => deal.status === 'pending').length;

        // Count closed deals
        const closed = deals.filter(deal => deal.status === 'closed').length;

        const active = deals.filter(
            deal =>
                deal.status !== 'closed' &&
                !deal.status.startsWith('rejected_')
        ).length;

        const cancelled = deals.filter(
            deal =>
                deal.status === 'rejected_by_shipper' ||
                deal.status === 'rejected_by_seller' ||
                deal.status === 'rejected_by_buyer'
        ).length;

        const shared = deals.filter(
            deal => deal.senderId.toString() === id
        ).length;

        const received = deals.filter(
            deal => deal.assignedTo.toString() === id
        ).length;

        res.status(200).json({
            message: 'Deals retrieved successfully',
            counts: {
                total,
                pending,
                closed,
                active,
                cancelled,
                shared,
                received
            },
            deals
        });
    } catch (error) {
        console.error('Error fetching deals and counts:', error);
        res.status(500).json({ error: 'Failed to fetch deals and counts' });
    }
};

export const getDealById = async (req, res) => {
  const { dealId } = req.params;

  try {
    const deal = await Deal.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(dealId) } // Match the deal by its ID
      },
      {
        $lookup: {
          from: 'messages', // The name of the Message collection
          localField: 'history',
          foreignField: '_id',
          as: 'historyDetails' // Join messages into historyDetails
        }
      },
      {
        $lookup: {
          from: 'projectinfos', // The name of the projectInfo collection
          let: { movieIds: '$movies.movieId' }, // Pass movieId array to the lookup
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', { $map: { input: '$$movieIds', as: 'id', in: { $toObjectId: '$$id' } } }] } // Match _id in projectInfo with movieId
              }
            }
          ],
          as: 'movieDetails' // Join projectInfo data into movieDetails
        }
      }
    ]);

    if (!deal || deal.length === 0) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.status(200).json({
      message: 'Deal retrieved successfully',
      deal: deal[0] // Return the first (and only) deal from the aggregation result
    });
  } catch (error) {
    console.error('Error fetching deal by ID:', error);
    res.status(500).json({ error: 'Failed to fetch deal' });
  }
};

export const getUnreadMessageCount = async (req, res) => {
  const { userId } = req.params; // Extract dealId and userId from request parameters

  try {
    // Count unread messages for the given deal where the user is the receiver
    const unreadCount = await Message.countDocuments({
      receiverId: userId, // Only count messages where the user is the receiver
      read: false // Only count unread messages
    });

    res.status(200).json({
      message: 'Unread message count retrieved successfully',
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({ error: 'Failed to fetch unread message count' });
  }
};

export const markMessagesAsRead = async (req, res) => {
  const { dealId, userId } = req.params; // Extract dealId and userId from request parameters

  try {
    // Update all unread messages for the given deal where the user is the receiver
    const result = await Message.updateMany(
      { dealId, receiverId: userId, read: false }, // Match unread messages where the user is the receiver
      { $set: { read: true } } // Mark them as read
    );

    res.status(200).json({
      message: 'Messages marked as read successfully',
      updatedCount: result.modifiedCount // Number of messages updated
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

export const getMessageHistory = async (req, res) => {
  const { dealId } = req.params; // Extract dealId from request parameters

  try {
    // Find all messages for the given dealId, sorted by timestamp
    const messages = await Message.find({ dealId }).sort({ timestamp: 1 });

    if (!messages || messages.length === 0) {
      return res.status(404).json({ message: 'No messages found for this deal' });
    }

    res.status(200).json({
      message: 'Message history retrieved successfully',
      history: messages
    });
  } catch (error) {
    console.error('Error fetching message history:', error);
    res.status(500).json({ error: 'Failed to fetch message history' });
  }
};