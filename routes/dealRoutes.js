import express from 'express';
import { addMessageAndUpdateStatus, createDealWithMessage, getDealById, getDealsWithCounts, getUnreadMessageCount, markMessagesAsRead, getMessageHistory, splitDealToSellers, sellerActionOnMovies } from '../controller/dealController.js';

const router = express.Router();


router.post('/create', createDealWithMessage);

router.post('/:dealId/message', addMessageAndUpdateStatus);

router.get('/deals-with-counts/:id', getDealsWithCounts);

router.get('/:dealId', getDealById);

// Route to get unread message count for a deal and user
router.get('/unread-count/:userId', getUnreadMessageCount);

// Route to mark messages as read for a deal and user
router.post('/:dealId/mark-read/:userId', markMessagesAsRead);

// Route to get message history for a deal
router.get('/:dealId/message-history', getMessageHistory);

router.post('/split-to-sellers', splitDealToSellers);

router.patch('/:dealId/action', sellerActionOnMovies);

export default router;