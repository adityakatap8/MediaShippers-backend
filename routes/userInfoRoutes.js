import express from 'express';
import { fetchCurrentUserInfo } from '../controller/userInfoController.js';

const userInfoRouter = express.Router();

// GET /api/user/info
userInfoRouter.get('/info', fetchCurrentUserInfo);

export default userInfoRouter;
