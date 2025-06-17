import express from 'express';
import {addToCart, deleteCartMovie, getCart} from '../controller/cartController.js'


const router = express.Router();

router.post('/add-to-cart', addToCart);
router.get('/get-cart/:userId', getCart);
router.delete('/:userId/:cartItemId', deleteCartMovie);

export default router; 