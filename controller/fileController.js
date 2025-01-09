import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// Folder creation in S3 (unchanged)
export const createFolder = async (folderPath) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${folderPath}/`,
    };
    try {
        await s3.putObject(params).promise();
        console.log(`Folder ${folderPath} created successfully.`);
    } catch (error) {
        console.error('Error creating folder:', error);
        throw new Error('Failed to create folder in S3');
    }
};

// File upload to S3
export const uploadFile = async (folderPath, file) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${folderPath}/${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,  // Ensure Content-Type is set
    };
    try {
        const uploadResult = await s3.upload(params).promise();
        console.log(`File ${file.originalname} uploaded successfully.`, uploadResult);
        return uploadResult;  // Returning the result
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
};

// File upload handler
export const uploadFileHandler = async (req, res) => {
    const { folderPath } = req.body;
    const file = req.file;

    if (!folderPath || !file) {
        return res.status(400).send('Folder path and file are required.');
    }

    try {
        // Upload the file to S3
        await uploadFile(folderPath, file);
        res.status(200).send({ message: 'File uploaded successfully.' });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send({ error: `Error uploading file: ${error.message}` });
    }
};
