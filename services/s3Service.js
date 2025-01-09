import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const createFolder = async (folderPath) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${folderPath}/`,
    };
    return s3.putObject(params).promise();
};

export const uploadFile = async (folderPath, file) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${folderPath}/${file.originalname}`,
        Body: file.buffer,
    };
    return s3.upload(params).promise();
};

export const listFolderContents = async (folderPath) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: folderPath ? `${folderPath}/` : '', // Root if no folderPath
        Delimiter: '/', // Ensures folder structure
    };

    const data = await s3.listObjectsV2(params).promise();

    const folders = (data.CommonPrefixes || []).map((prefix) => ({
        name: prefix.Prefix.split('/').filter(Boolean).pop(),
    }));

    const files = (data.Contents || [])
        .filter((item) => item.Key !== `${folderPath}/`) // Exclude the folder itself
        .map((item) => ({
            name: item.Key.split('/').pop(),
        }));

    return { folders, files };
};



// Function to delete a file from S3
export const deleteFile = async (filePath) => {
    console.log(`Attempting to delete file at path: ${filePath}`);

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filePath, // Use the exact file path without encoding
    };

    try {
        // Check if the file exists in S3
        const headParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: filePath, // Use the exact file path without encoding
        };

        await s3.headObject(headParams).promise(); // Check if file exists
        console.log(`File ${filePath} found. Proceeding with deletion.`);

        // Delete the file
        await s3.deleteObject(params).promise();
        console.log(`File ${filePath} deleted successfully.`);
    } catch (error) {
        if (error.code === 'NotFound') {
            console.error(`File ${filePath} not found in S3.`);
        } else if (error.code === 'AccessDenied') {
            console.error(`Access denied while trying to delete file: ${filePath}.`);
        } else {
            console.error('Error deleting file:', error);
        }

        // Throw a detailed error message
        throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
};





// Function to delete a folder (by deleting all objects in it)
export const deleteFolder = async (folderPath) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: folderPath,  // Use folder path as the prefix
    };

    try {
        // List all objects in the folder
        const listedObjects = await s3.listObjectsV2(params).promise();

        if (listedObjects.Contents.length === 0) {
            console.log('Folder is already empty or does not exist.');
            return;
        }

        // Delete all objects within the folder
        const deleteParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Delete: {
                Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
            },
        };

        await s3.deleteObjects(deleteParams).promise();
        console.log(`Folder ${folderPath} and its contents deleted successfully.`);
    } catch (error) {
        console.error('Error deleting folder:', error);
        throw new Error('Failed to delete folder from S3');
    }
};