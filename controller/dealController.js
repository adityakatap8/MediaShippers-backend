import mongoose from 'mongoose';
import Deal from '../models/Deal.js';
import Message from '../models/Message.js';
import { Cart } from '../models/Cart.js';
import { User } from '../models/User.js';

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

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'Sender or receiver not found' });
    }

    const senderRole = sender.role;
    const receiverRole = receiver.role;

    const savedDeal = await deal.save();

    let visibleTo = [];
    if (senderRole === 'Buyer' && receiverRole === 'Admin') {
      visibleTo = ['Admin', 'Buyer']; // Admin and Buyer can see this message
    } else if (senderRole === 'Admin' && receiverRole === 'Buyer') {
      visibleTo = ['Admin', 'Buyer']; // Admin and Buyer can see this message
    } else if (senderRole === 'Admin' && receiverRole === 'Seller') {
      visibleTo = ['Admin', 'Seller']; // Admin and Seller can see this message
    } else if (senderRole === 'Seller' && receiverRole === 'Admin') {
      visibleTo = ['Admin', 'Seller']; // Admin and seller can see this message
    }

    // Create the message linked to the deal
    const newMessage = new Message({
      dealId: savedDeal._id,
      senderId: message.senderId,
      receiverId,
      message: message.content,
      visibleTo
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
  const { senderId, receiverId, message } = req.body; // Include sender and receiver roles

  try {
    const deal = await Deal.findById(dealId);

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: 'Sender or receiver not found' });
    }

    const senderRole = sender.role;
    const receiverRole = receiver.role;

    console.log('Sender Role:', senderRole);
    console.log('Receiver Role:', receiverRole);

    // Determine visibility based on roles
    let visibleTo = [];
    if (senderRole === 'Buyer' && receiverRole === 'Admin') {
      visibleTo = ['Admin', 'Buyer']; // Admin and Buyer can see this message
    } else if (senderRole === 'Admin' && receiverRole === 'Buyer') {
      visibleTo = ['Admin', 'Buyer']; // Admin and Buyer can see this message
    } else if (senderRole === 'Admin' && receiverRole === 'Seller') {
      visibleTo = ['Admin', 'Seller']; // Admin and Seller can see this message
    } else if (senderRole === 'Seller' && receiverRole === 'Admin') {
      visibleTo = ['Admin', 'Seller']; // Admin and seller can see this message
    }

    const newMessage = new Message({
      dealId,
      senderId,
      receiverId,
      message,
      visibleTo
    });

    const savedMessage = await newMessage.save();

    // Add the message reference to the deal history array
    deal.history.push(savedMessage._id);
    await deal.save();

    res.status(201).json({
      message: 'Message added successfully',
      savedMessage
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
};

export const getDealsWithCounts = async (req, res) => {
  const { id } = req.params; // User ID (receiverId)

  try {
    const userId = new mongoose.Types.ObjectId(id);
    console.log('Fetching deals for user ID:', userId);

    const deals = await Deal.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { assignedTo: userId }],
        },
      },
      // Lookup user details for senderId
      {
        $lookup: {
          from: 'users',
          localField: 'senderId',
          foreignField: '_id',
          as: 'senderDetails',
        },
      },
      // Extract senderDetails as an object
      {
        $addFields: {
          senderDetails: { $arrayElemAt: ['$senderDetails', 0] },
        },
      },
      // Lookup user details for assignedTo
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedToDetails',
        },
      },
      // Extract assignedToDetails as an object
      {
        $addFields: {
          assignedToDetails: { $arrayElemAt: ['$assignedToDetails', 0] },
        },
      },
      // Lookup child deals
      {
        $lookup: {
          from: 'deals',
          localField: '_id',
          foreignField: 'parentDealId',
          as: 'childDeals',
        },
      },
      // Lookup senderDetails for childDeals
      {
        $lookup: {
          from: 'users',
          localField: 'childDeals.senderId',
          foreignField: '_id',
          as: 'childSenderDetails',
        },
      },
      // Add senderDetails to childDeals
      {
        $addFields: {
          childDeals: {
            $map: {
              input: '$childDeals',
              as: 'childDeal',
              in: {
                $mergeObjects: [
                  '$$childDeal',
                  {
                    senderDetails: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$childSenderDetails',
                            as: 'user',
                            cond: { $eq: ['$$user._id', '$$childDeal.senderId'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      // Lookup unread messages for parent deals
      {
        $lookup: {
          from: 'messages',
          let: { dealId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$dealId', '$$dealId'] },
                    { $eq: ['$receiverId', userId] },
                    { $eq: ['$read', false] },
                  ],
                },
              },
            },
          ],
          as: 'unreadMessages',
        },
      },
      // Lookup unread messages for child deals
      {
        $lookup: {
          from: 'messages',
          let: { childDealIds: '$childDeals._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$dealId', '$$childDealIds'] },
                    { $eq: ['$receiverId', userId] },
                    { $eq: ['$read', false] },
                  ],
                },
              },
            },
          ],
          as: 'childUnreadMessages',
        },
      },
      // Add unreadMessageCount to childDeals
      {
        $addFields: {
          childDeals: {
            $map: {
              input: '$childDeals',
              as: 'childDeal',
              in: {
                $mergeObjects: [
                  '$$childDeal',
                  {
                    unreadMessageCount: {
                      $size: {
                        $filter: {
                          input: '$childUnreadMessages',
                          as: 'msg',
                          cond: { $eq: ['$$msg.dealId', '$$childDeal._id'] },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      // Add unreadMessageCount for parent deals
      {
        $addFields: {
          unreadMessageCount: { $size: '$unreadMessages' },
        },
      },
      {
        $project: {
          unreadMessages: 0,
          childUnreadMessages: 0, // Exclude intermediate fields
        },
      },
    ]);

    // Stats calculation
    const total = deals.length;
    const pending = deals.filter((deal) => deal.status === 'pending').length;
    const closed = deals.filter((deal) => deal.status === 'closed').length;
    const active = deals.filter(
      (deal) =>
        deal.status !== 'closed' && !deal.status.startsWith('rejected_')
    ).length;
    const cancelled = deals.filter((deal) =>
      ['rejected_by_shipper', 'rejected_by_seller', 'rejected_by_buyer'].includes(
        deal.status
      )
    ).length;
    const shared = deals.filter((deal) => deal.senderId.toString() === id).length;
    const received = deals.filter(
      (deal) => deal.assignedTo?.toString() === id
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
        received,
      },
      deals, // Include unreadMessageCount for each deal and child deal
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
  const { dealId, userId } = req.params; // Extract dealId and userId from request parameters

  try {
    // Count unread messages for the given deal where the user is the receiver
    const unreadCount = await Message.countDocuments({
      dealId,
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

// export const getMessageHistory = async (req, res) => {
//   const { dealId } = req.params; // Extract dealId from request parameters
//   const { loggedInUserId, loggedInUserRole, selectedUserId } = req.query; // Extract logged-in user ID, role, and selected user ID from query parameters

//   try {
//     // Validate input
//     if (!loggedInUserId || !loggedInUserRole) {
//       return res.status(400).json({ message: 'Logged-in user ID and role are required' });
//     }

//     // Build the query based on the logged-in user's role
//     let query;

//     if (loggedInUserRole === 'Admin') {

//       query = {
//         dealId,
//         visibleTo: loggedInUserRole, // Ensure messages are visible to admin
//         $or: [
//           { senderId: loggedInUserId, receiverId: selectedUserId }, // Messages sent by admin to the selected user
//           { senderId: selectedUserId, receiverId: loggedInUserId }  // Messages sent by the selected user to admin
//         ]
//       };
//     } else if (loggedInUserRole === 'Buyer' || loggedInUserRole === 'Seller') {
//       // Buyer or seller viewing chat with admin
//       query = {
//         dealId,
//         visibleTo: loggedInUserRole, // Ensure messages are visible to the buyer/seller
//         $or: [
//           { senderId: loggedInUserId, receiverId: { $ne: loggedInUserId } }, // Messages sent by buyer/seller to admin
//           { senderId: { $ne: loggedInUserId }, receiverId: loggedInUserId }  // Messages sent by admin to buyer/seller
//         ]
//       };
//     } else {
//       return res.status(400).json({ message: 'Invalid user role' });
//     }

//     console.log('Query for message history:', query);

//     // Find all messages for the given dealId, filtered by query and sorted by timestamp
//     const messages = await Message.find(query).sort({ timestamp: 1 });

//     if (!messages || messages.length === 0) {
//       return res.status(404).json({ message: 'No messages found for this deal' });
//     }

//     res.status(200).json({
//       message: 'Message history retrieved successfully',
//       history: messages
//     });
//   } catch (error) {
//     console.error('Error fetching message history:', error);
//     res.status(500).json({ error: 'Failed to fetch message history' });
//   }
// };


export const getMessageHistory = async (req, res) => {
  const { dealId } = req.params;
  const { loggedInUserId, loggedInUserRole, selectedUserId } = req.query;

  try {
    if (!dealId || !mongoose.Types.ObjectId.isValid(dealId)) {
      return res.status(400).json({ message: 'Invalid or missing dealId' });
    }
    if (!loggedInUserId || !loggedInUserRole) {
      return res.status(400).json({ message: 'Logged-in user ID and role are required' });
    }

    // Use dealId directly (no parent/child deals)
    let query = {
      dealId: dealId
    };

    const messages = await Message.find(query).sort({ timestamp: 1 });

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



export const splitDealToSellers = async (req, res) => {
  try {
    const { dealId, userId } = req.body;

    const existingDeal = await Deal.findById(dealId);
    if (!existingDeal) return res.status(404).json({ message: 'Deal not found' });
    console.log('Splitting deal:', existingDeal);
    const movieDetails = existingDeal.movies;
    console.log('Movie details in deal:', movieDetails);
    if (!movieDetails || movieDetails.length === 0) {
      return res.status(400).json({ message: 'No movie details available in deal' });
    }

    // Group movies by userId (seller)
    const sellerMap = {};
    movieDetails.forEach((movie) => {
      const sellerId = movie.userId?.toString();
      if (!sellerId) return;

      if (!sellerMap[sellerId]) {
        sellerMap[sellerId] = [];
      }
      sellerMap[sellerId].push({
        movieId: movie.movieId,
      });
    });

    const createdDeals = [];

    // Create a deal per seller
    for (const [sellerId, movies] of Object.entries(sellerMap)) {
      const newDeal = new Deal({
        senderId: userId,
        movies,
        rights: existingDeal.rights,
        territory: existingDeal.territory,
        licenseTerm: existingDeal.licenseTerm,
        usageRights: existingDeal.usageRights,
        paymentTerms: existingDeal.paymentTerms,
        remarks: existingDeal.remarks,
        assignedTo: sellerId,
        status: 'sent_to_seller',
        history: [],
        parentDealId: existingDeal._id,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedDeal = await newDeal.save();
      createdDeals.push(savedDeal);
    }

    return res.status(200).json({
      message: 'Deals successfully created for each seller',
      count: createdDeals.length,
      deals: createdDeals
    });

  } catch (error) {
    console.error('Error splitting deal:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const sellerActionOnMovies = async (req, res) => {
  try {
    const { dealId } = req.params;
    const { movies } = req.body;

    console.log('Seller action on movies:', movies);

    if (!Array.isArray(movies) || movies.length === 0) {
      return res.status(400).json({ message: 'No movie actions provided' });
    }

    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    let updated = false;

    movies.forEach(({ movieId, status, remarks }) => {
      if (!['accepted', 'rejected', 'negotiation'].includes(status)) return;

      const movie = deal.movies.find(m => m.movieId === movieId);
      if (movie) {
        movie.status = status;
        movie.remarks = remarks || '';
        movie.updatedAt = new Date();
        updated = true;
      }
    });

    console.log('Updated movies:', updated);

    if (!updated) return res.status(400).json({ message: 'No valid movie updates found' });

    deal.status = 'deal_from_seller';

    deal.updatedAt = new Date();
    await deal.save();
    console.log('Deal after updates:', deal);
    return res.status(200).json({ message: 'Movie statuses updated', deal });

  } catch (error) {
    console.error('Error in seller action:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

