import AWS from 'aws-sdk';
import dotenv from 'dotenv';

import { URL } from 'url';



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

    console.log("folders ==>", folders);
    console.log("files ==>", files);
    return { folders, files }; // ✅ Return data instead of using res.json()

  } catch (error) {
    console.error("Error fetching S3 data:", error);
    throw new Error("Error fetching S3 data"); // ✅ Throw error instead of using res
  }
};



// Function to delete a folder by deleting all objects (files and subfolders) inside it
// export const deleteFolder = async (folderPath) => {
//   const BUCKET_NAME = process.env.S3_BUCKET_NAME;

//   if (!BUCKET_NAME) {
//     throw new Error("❌ S3_BUCKET_NAME environment variable is not defined.");
//   }

//   console.log("S3_BUCKET_NAME =", BUCKET_NAME);
//   console.log("Folder path =", folderPath);

//   try {
//     let continuationToken = undefined;

//     do {
//       const params = {
//         Bucket: BUCKET_NAME,
//         Prefix: folderPath,
//         ContinuationToken: continuationToken,
//       };

//       const listedObjects = await s3.listObjectsV2(params).promise();

//       if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
//         console.log('Folder is empty or does not exist.');
//         break;
//       }

//       const deleteParams = {
//         Bucket: BUCKET_NAME,
//         Delete: {
//           Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
//           Quiet: false,
//         },
//       };

//       await s3.deleteObjects(deleteParams).promise();
//       console.log(`✅ Deleted ${listedObjects.Contents.length} objects from folder "${folderPath}"`);

//       continuationToken = listedObjects.IsTruncated ? listedObjects.NextContinuationToken : undefined;
//     } while (continuationToken);

//     console.log(`✅ Folder "${folderPath}" and all its contents deleted successfully.`);
//   } catch (error) {
//     console.error('❌ Error deleting folder:', error);
//     throw new Error('Failed to delete folder from S3');
//   }
// };

export const deleteFolder = async (folderPath) => {
  const BUCKET_NAME = process.env.S3_BUCKET_NAME;

  if (!BUCKET_NAME) {
    throw new Error("❌ S3_BUCKET_NAME environment variable is not defined.");
  }

  console.log("S3_BUCKET_NAME =", BUCKET_NAME);
  console.log("Folder path =", folderPath);

  try {
    let continuationToken = undefined;
    let totalDeleted = 0;

    do {
      const params = {
        Bucket: BUCKET_NAME,
        Prefix: folderPath,
        ContinuationToken: continuationToken,
      };

      const listedObjects = await s3.listObjectsV2(params).promise();

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        console.log('📂 Folder is empty or does not exist.');
        break;
      }

      const deleteParams = {
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
          Quiet: false,
        },
      };

      const deleteResponse = await s3.deleteObjects(deleteParams).promise();
      const deletedCount = deleteResponse.Deleted?.length || 0;
      totalDeleted += deletedCount;

      console.log(`✅ Deleted ${deletedCount} objects from folder "${folderPath}"`);

      continuationToken = listedObjects.IsTruncated ? listedObjects.NextContinuationToken : undefined;

    } while (continuationToken);

    console.log(`✅ Folder "${folderPath}" and all its contents deleted successfully.`);

    return {
      success: true,
      deleted: totalDeleted,
      folderPath,
      message: `Folder "${folderPath}" deleted successfully.`,
    };

  } catch (error) {
    console.error('❌ Error deleting folder:', error);
    throw new Error(error.message || 'Failed to delete folder from S3');
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


const convertS3UriToHttpUrl = (s3Uri) => {
  if (!s3Uri.startsWith('s3://')) return s3Uri;
  const [, bucketAndKey] = s3Uri.split('s3://');
  const [bucket, ...keyParts] = bucketAndKey.split('/');
  const key = keyParts.join('/');
  return `https://${bucket}.s3.amazonaws.com/${encodeURIComponent(key)}`;
};

// services/s3Service.js

export const transferFilesBetweenBuckets = async (sourceUrl, destinationUrl, fileType) => {
  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error('Missing AWS credentials');
  }

  const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION
  });

  const parseS3 = (url) => {
    if (url.startsWith('s3://')) {
      const [bucket, ...keyParts] = url.slice(5).split('/');
      return { bucket, key: keyParts.join('/') };
    } else {
      const { hostname, pathname } = new URL(url);
      const bucket = hostname.split('.')[0];
      return { bucket, key: decodeURIComponent(pathname.slice(1)) };
    }
  };

  const { bucket: srcBuc, key: srcKey } = parseS3(sourceUrl);
  const { bucket: dstBuc, key: dstKey } = parseS3(destinationUrl);

  try {
    await s3.headObject({ Bucket: srcBuc, Key: srcKey }).promise();
  } catch (err) {
    throw new Error(`Source file not found: ${srcBuc}/${srcKey}`);
  }

  try {
    await s3.copyObject({
      Bucket: dstBuc,
      Key: dstKey,
      CopySource: encodeURIComponent(`${srcBuc}/${srcKey}`), // critical!
      ACL: 'private'
    }).promise();
  } catch (err) {
    throw new Error(`Copy failed: ${err.message}`);
  }

  return {
    url: `https://${dstBuc}.s3.${AWS_REGION}.amazonaws.com/${dstKey}`
  };
};





// export const transferFilesBetweenBuckets = async (
//   sourceUrl,
//   destinationUrl,
//   accessKeyId,
//   secretAccessKey,
//   fileType
// ) => {
//   const s3 = new AWS.S3({ accessKeyId, secretAccessKey });
//   console.log("📦 Inside service for file transfer");

//   const parseS3Url = (s3Url) => {
//     if (s3Url.startsWith('s3://')) {
//       const urlWithoutProtocol = s3Url.slice(5);
//       const [bucket, ...keyParts] = urlWithoutProtocol.split('/');
//       return { bucket, key: keyParts.join('/') };
//     } else if (s3Url.startsWith('https://')) {
//       const url = new URL(s3Url);
//       const [bucket] = url.hostname.split('.');
//       return { bucket, key: decodeURIComponent(url.pathname.slice(1)) };
//     }
//     throw new Error(`Unsupported URL format: ${s3Url}`);
//   };

//   const { bucket: srcBucket, key: srcKey } = parseS3Url(sourceUrl);
//   const { bucket: destBucket, key: destKey } = parseS3Url(destinationUrl);

//   console.log(`[${fileType}] Copying from: s3://${srcBucket}/${srcKey}`);
//   console.log(`[${fileType}] To destination: s3://${destBucket}/${destKey}`);

//   try {
//     // Check source exists
//     await s3.headObject({ Bucket: srcBucket, Key: srcKey }).promise();
//     console.log(`[${fileType}] ✅ Source file exists.`);

//     // Copy object
//     await s3.copyObject({
//       Bucket: destBucket,
//       Key: destKey,
//       CopySource: `${srcBucket}/${srcKey}`, // ✅ DO NOT ENCODE
//       ACL: 'private',
//     }).promise();

//     console.log(`[${fileType}] ✅ Copy successful.`);
//     return {
//       url: `https://${destBucket}.s3.amazonaws.com/${encodeURIComponent(destKey).replace(/%2F/g, '/')}`,
//     };
//   } catch (err) {
//     console.error(`[${fileType}] ❌ Error during copy:`, err.message);
//     throw err;
//   }
// };




// Deletes a file from S3 using its full URL
export const deleteFileFromUrl = async (fileUrl) => {
  const bucketName = process.env.S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;

  const possiblePrefixes = [
    `https://${bucketName}.s3.${region}.amazonaws.com/`,
    `https://${bucketName}.s3.amazonaws.com/`
  ];

  const matchedPrefix = possiblePrefixes.find(prefix => fileUrl.startsWith(prefix));

  if (!matchedPrefix) {
    throw new Error('Invalid S3 file URL. Must begin with correct bucket domain.');
  }

  // Extract the S3 key (file path)
  const filePath = decodeURIComponent(fileUrl.replace(matchedPrefix, ''));

  // Use your existing deleteFile function
  await deleteFile(filePath);
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




