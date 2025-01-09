import express from 'express';
import { createFolderHandler, listFolderContentsHandler, deleteItemHandler } from '../controller/folderController.js';

const router = express.Router();


router.post('/create-folder', createFolderHandler);
router.get('/list-folder', listFolderContentsHandler);
router.post('/delete-item', deleteItemHandler);
export default router;
