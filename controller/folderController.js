import { createFolder } from '../services/s3Service.js';
import { listFolderContents } from '../services/s3Service.js';
import { deleteFile } from '../services/s3Service.js';  
import { deleteFolder } from '../services/s3Service.js'; 

export const createFolderHandler = async (req, res) => {
    const { folderPath } = req.body;

    if (!folderPath) {
        return res.status(400).send('Folder path is required.');
    }

    try {
        await createFolder(folderPath);
        res.status(200).send({ message: 'Folder created successfully.' });
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).send({ error: 'Error creating folder.' });
    }
};

export const listFolderContentsHandler = async (req, res) => {
    const folderPath = req.query.folderPath || ''; // Root if no folderPath provided

    try {
        const { folders, files } = await listFolderContents(folderPath);
        res.status(200).send({ folders, files });
    } catch (error) {
        console.error('Error fetching folder contents:', error);
        res.status(500).send({ error: 'Error fetching folder contents.' });
    }
};

export const deleteItemHandler = async (req, res) => {
    const { itemPath, type } = req.body;

    if (!itemPath || !type) {
        return res.status(400).send('Item path and type are required.');
    }

    try {
        console.log(`Attempting to delete item at path: ${itemPath}`);

        if (type === 'folder') {
            await deleteFolder(itemPath);
        } else if (type === 'file') {
            await deleteFile(itemPath);  // Use the full path for file deletion
        }

        res.status(200).send({ message: 'Item deleted successfully.' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).send({ error: `Error deleting ${type}: ${error.message}` });
    }
};
