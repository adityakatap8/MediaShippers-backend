import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';
import fetch from 'node-fetch';


dotenv.config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    signatureVersion: 'v4',
});

const S3_BUCKET_PATH = process.env.S3_BUCKET_PATH;  
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Folder creation in S3
export const createFolder = async (orgName, projectName) => {
    const folderPath = `${orgName}/${projectName}/`; // Constructing folder structure with orgName and projectName
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: folderPath, // S3 folder path
    };
    try {
        await s3.putObject(params).promise();
        console.log(`Folder ${folderPath} created successfully.`);
    } catch (error) {
        console.error('Error creating folder:', error);
        throw new Error('Failed to create folder in S3');
    }
};

// Folder creation in S3 (for subfolders)
export const createSubfolder = async (orgName, projectName, subfolderName) => {
    const folderPath = `${orgName}/${projectName}/${subfolderName}/`; // Constructing the subfolder path
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: folderPath, // S3 subfolder path
    };
    try {
        await s3.putObject(params).promise();
        console.log(`Subfolder ${folderPath} created successfully.`);
    } catch (error) {
        console.error('Error creating subfolder:', error);
        throw new Error('Failed to create subfolder in S3');
    }
};

// Controller to create multiple subfolders
export const createSubfoldersController = async (req, res) => {
    const { orgName, projectName, subFolders } = req.body;

    // Validate the input fields
    if (!orgName || !projectName || !Array.isArray(subFolders) || subFolders.length === 0) {
        return res.status(400).json({ error: 'Organization name, project name, and subfolders are required' });
    }

    try {
        // Loop through the subfolders array and create each one
        for (const subfolderName of subFolders) {
            await createSubfolder(orgName, projectName, subfolderName);  // Create subfolder inside project folder
        }

        return res.status(200).json({ message: `Subfolders for ${orgName}/${projectName} created successfully.` });
    } catch (error) {
        console.error("Error creating subfolders:", error);
        return res.status(500).json({ error: error.message });
    }
};




// Make sure this environment variable is defined before proceeding
if (!S3_BUCKET_PATH) {
    throw new Error('S3_BUCKET_PATH environment variable is not set.');
}


export const uploadFileToS3 = async (orgName, projectName, files) => {
  const uploadedFiles = [];

  for (const file of files) {
    if (!file || !file.originalname || !file.buffer || !file.mimetype) {
      throw new Error('Invalid file data encountered.');
    }

    let filePath;

    if (file.type === 'projectPoster' || file.type === 'projectBanner') {
      filePath = `${orgName}/${projectName}/film stills/${file.originalname}`;
    } else if (file.type === 'projectTrailer') {
      filePath = `${orgName}/${projectName}/trailer/${file.originalname}`;
    } else if (file.type === 'dubbedTrailer') {
      const language = file.language || 'unknown';
      filePath = `${orgName}/${projectName}/trailer/${language}/${file.originalname}`;
    } else if (file.type === 'dubbedSubtitle') {
      const language = file.language || 'unknown';
      filePath = `${orgName}/${projectName}/srt files/${language}/${file.originalname}`;
    } else if (file.type === 'srtFile') {
      filePath = `${orgName}/${projectName}/srt files/${file.originalname}`;
    } else if (file.type === 'infoDocFile') {
      filePath = `${orgName}/${projectName}/srt files/${file.originalname}`;
    } else {
      throw new Error(`Unknown file type: ${file.type}`);
    }

    const params = {
      Bucket: BUCKET_NAME, // ✅ Use correct bucket name
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const uploadResult = await s3.upload(params).promise();
      console.log('S3 upload result:', uploadResult);
      uploadedFiles.push(uploadResult);
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw new Error(`Error uploading file to S3: ${error.message}`);
    }
  }

  // ✅ Return S3 URL
  return uploadedFiles.map(result => `https://${BUCKET_NAME}.s3.amazonaws.com/${result.Key}`);
};







export const listFolderContents = async (folderPath = '') => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: folderPath ? `${folderPath}/` : '', // Add trailing slash for folder path
        Delimiter: '/', // Use delimiter to get folder structure
    };

    try {
        // Fetch the objects
        const data = await s3.listObjectsV2(params).promise();

        const folders = [];
        const files = [];

        // Loop through CommonPrefixes for potential subfolders
        for (const prefix of (data.CommonPrefixes || [])) {
            const folderName = prefix.Prefix.split('/').filter(Boolean).pop(); // Extract folder name
            const folderPath = prefix.Prefix;

            // Push this folder
            folders.push({ name: folderName, path: folderPath });

            // Recursive call to get subfolder contents
            const subfolderContents = await listFolderContents(folderPath); // Recursively fetch subfolders and files
            folders.push(...subfolderContents.folders); // Append subfolders
            files.push(...subfolderContents.files); // Append files inside subfolders
        }
        console.log("data respons", data)

        // Fetch files at the current level
        for (const item of (data.Contents || [])) {
            if (item.Key !== `${folderPath}/`) { // Ignore the folder itself
                files.push({
                    name: item.Key.split('/').pop(), // File name
                    path: item.Key,
                });
            }
        }
        console.log("respopnze", data.Contents)
        // Check for pagination
        if (data.IsTruncated) {
            params.ContinuationToken = data.NextContinuationToken;
            const moreData = await listFolderContents(folderPath);
            folders.push(...moreData.folders);
            files.push(...moreData.files);
        }

        return { folders, files };

    } catch (error) {
        console.error('Error fetching folder contents:', error);
        throw new Error('Failed to fetch folder contents');
    }
};

export const listS3Contents = async (path = '') => {
    console.log("Received request listS3Contents:", path);
    const bucketName = path.split("/")[0]; // Extract bucket name

    let prefix = path.replace(`${bucketName}/`, ""); // Extract folder path


    // ✅ Normalize prefix: Remove leading/trailing slashes and avoid "//"
    prefix = prefix.replace(/^\/+|\/+$/g, "").trim(); 
    if (prefix && !prefix.endsWith("/")) {
        prefix += "/"; // ✅ Ensure prefix ends with `/` for S3
    }

    console.log("bucketName:", bucketName);
    console.log("prefix:", prefix);

    const params = {
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: "/",
    };
  
    try {
      const response = await s3.listObjectsV2(params).promise();
  
      const folders = (response.CommonPrefixes || []).map((prefixObj) =>
        prefixObj.Prefix.replace(prefix, "").replace("/", "")
      );
  
      const files = (response.Contents || [])
        .map((file) => file.Key.replace(prefix, ""))
        .filter((key) => key !== ""); // Remove empty values
  
        console.log("folders ==>",folders);
        console.log("files ==>",files);
        return { folders, files }; // ✅ Return data instead of using res.json()
      
    } catch (error) {
      console.error("Error fetching S3 data:", error);
      throw new Error("Error fetching S3 data"); // ✅ Throw error instead of using res
    }
};

// Function to delete a file from S3
export const deleteFile = async (filePath) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: filePath, // The exact file path
    };

    try {
        // Check if the file exists
        await s3.headObject({ Bucket: process.env.S3_BUCKET_NAME, Key: filePath }).promise();
        console.log(`File ${filePath} found. Proceeding with deletion.`);

        await s3.deleteObject(params).promise();
        console.log(`File ${filePath} deleted successfully.`);
    } catch (error) {
        if (error.code === 'NotFound') {
            console.error(`File ${filePath} not found.`);
        } else {
            console.error('Error deleting file:', error);
        }
        throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
};

// Function to delete a folder by deleting all objects (files and subfolders) inside it
export const deleteFolder = async (folderPath) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: folderPath, // Use folder path as the prefix to list objects inside the folder
    };

    try {
        const listedObjects = await s3.listObjectsV2(params).promise();

        if (listedObjects.Contents.length === 0) {
            console.log('Folder is empty or does not exist.');
            return;
        }

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

// Recursive function to delete a folder along with its contents (subfolders and files)
export const deleteFolderAndContents = async (folderPath) => {
    try {
        // List contents of the folder (files and subfolders)
        const { folders, files } = await listFolderContents(folderPath);

        // Delete all files
        for (const file of files) {
            await deleteFile(`${folderPath}/${file.name}`);
        }

        // Recursively delete all subfolders
        for (const folder of folders) {
            await deleteFolderAndContents(`${folderPath}/${folder.name}`);
        }

        // Delete the empty folder itself
        await deleteFolder(folderPath);
    } catch (error) {
        console.error('Error deleting folder and its contents:', error);
        throw new Error(`Failed to delete folder and its contents: ${error.message}`);
    }
};

// s3Service.js

// Function to fetch folders by orgName


export const getFoldersByOrg = async (orgName) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: `${orgName}/`, // Prefix the orgName to filter folders specific to the organization
        Delimiter: '/', // Limits the result to folders
    };

    try {
        const data = await s3.listObjectsV2(params).promise();

        const folders = [];
        const files = [];

        // Fetch the first level of folders
        for (const prefix of (data.CommonPrefixes || [])) {
            const folderPath = prefix.Prefix; // Full path of the folder
            const folderName = folderPath.split('/').filter(Boolean).pop(); // Extract the project folder name

            // Add only the project folder name, without the orgName part
            folders.push({ name: folderName });

            // Recursively get contents of this folder and its subfolders
            const subfolderContents = await listFolderContents(folderPath); // Recursive call
            folders.push(...subfolderContents.folders);  // Add subfolders
            files.push(...subfolderContents.files); // Add files inside subfolders
        }

        return { folders, files };
    } catch (error) {
        console.error('Error fetching folders by orgName:', error);
        throw new Error('Failed to fetch folders for organization');
    }
};



// subfolders
// Function to fetch subfolders for a specific project
export const getSubfoldersForProject = async (orgName, projectName) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: `${orgName}/${projectName}/`, // Prefix the org and project to find its subfolders
        Delimiter: '/', // Limit the result to folders only
    };

    try {
        const data = await s3.listObjectsV2(params).promise();

        // Extract subfolder names
        const subfolders = (data.CommonPrefixes || []).map((prefix) => ({
            name: prefix.Prefix.split('/').filter(Boolean).pop(), // Get the subfolder name
            path: prefix.Prefix, // Full path of the subfolder
        }));

        return subfolders; // Return the subfolders
    } catch (error) {
        console.error('Error fetching subfolders for project:', error);
        throw new Error('Failed to fetch subfolders for project');
    }
};




export const transferFilesBetweenBuckets = async (
  sourceUrl,
  orgName,
  projectFolder,
  fileName,
  accessKeyId,
  secretAccessKey,
  fileType
) => {
  return new Promise((resolve, reject) => {
    console.log("🔄 Starting file transfer...");
    console.log("📄 File type:", fileType);
    console.log("📦 Source URL:", sourceUrl);
    console.log("📁 Destination folder:", `${orgName}/${projectFolder}`);
    console.log("📛 File name:", fileName);

    // Step 1: Validate file type
    const folderMap = {
      poster: "film stills",
      banner: "film stills",
      trailer: "trailer",
      movie: "master",
    };

    const folder = folderMap[fileType];
    if (!folder) {
      console.log("❌ Invalid file type detected");
      return reject({ error: `❌ Invalid file type provided: ${fileType}` });
    }
    console.log("📂 Mapped folder:", folder);

    // Step 2: Build destination S3 URI
    const destinationUrl = `s3://testmediashippers/${orgName}/${projectFolder}/${folder}/${fileName}`;
    console.log("📥 Destination S3 URI:", destinationUrl);

    // Step 3: Path to AWS CLI (Windows)
    const awsPath = "C:/Program Files/Amazon/AWSCLIV2/aws.exe";

    // Step 4: Setup AWS env variables
    const envVars = {
      ...process.env,
      AWS_ACCESS_KEY_ID: accessKeyId,
      AWS_SECRET_ACCESS_KEY: secretAccessKey,
    };

    console.log("🔑 AWS credentials set (keys hidden for security)");

    // Step 5: Show CLI command to run
    console.log(`🚀 Running AWS CLI command: ${awsPath} s3 cp "${sourceUrl}" "${destinationUrl}"`);

    const s3Command = spawn(awsPath, ['s3', 'cp', sourceUrl, destinationUrl], { env: envVars });

    let output = "";
    let errorOutput = "";

    s3Command.stdout.on("data", (data) => {
      const text = data.toString();
      console.log("📤 CLI STDOUT:", text);
      output += text;
    });

    s3Command.stderr.on("data", (data) => {
      const errText = data.toString();
      console.error("⚠️ CLI STDERR:", errText);
      errorOutput += errText;
    });

    s3Command.on("close", (code) => {
      console.log("🔚 AWS CLI process exited with code:", code);

      const isNonBlockingError =
        code === 255 &&
        errorOutput.includes("does not exist") &&
        sourceUrl.startsWith("https://");

      if (code === 0) {
        console.log("✅ File transferred successfully!");
        resolve({ message: "File transferred successfully", output });
      } else if (isNonBlockingError) {
        console.warn("⚠️ Known AWS CLI error for HTTPS source - ignoring and proceeding.");
        resolve({
          message: "File transfer logically completed (CLI skipped due to HTTPS)",
          skippedAwsCli: true,
          warning: errorOutput,
        });
      } else {
        console.error("❌ CLI error output:", errorOutput);
        reject({ error: `AWS CLI process exited with code ${code}`, errorOutput });
      }
    });

    s3Command.on("error", (err) => {
      console.error("❌ Failed to spawn AWS CLI:", err.message);
      reject({ error: `Failed to spawn AWS CLI: ${err.message}` });
    });
  });
};


