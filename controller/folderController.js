import { createFolder } from '../services/s3Service.js';
import { listFolderContents, listS3Contents } from '../services/s3Service.js';
import { deleteFile } from '../services/s3Service.js';  
import { deleteFolder } from '../services/s3Service.js'; 
import { getFoldersByOrg } from '../services/s3Service.js'
import { getSubfoldersForProject  } from '../services/s3Service.js'
import { createSubfolder } from '../services/s3Service.js'
import ProjectInfo from '../models/projectFormModels/FormModels/ProjectInfoSchema.js';


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

// export const listFolderContentsHandler = async (req, res) => {
//     const folderPath = req.query.folderPath || ''; // Root if no folderPath provided

//     try {
//         const { folders, files } = await listFolderContents(folderPath);
//         res.status(200).send({ folders, files });
//     } catch (error) {
//         console.error('Error fetching folder contents:', error);
//         res.status(500).send({ error: 'Error fetching folder contents.' });
//     }
// };


export const listFolderContentsHandler = async (req, res) => {
    const folderPath = req.query.folderPath || ''; // Root if no folderPath provided

    try {
        const { folders, files } = await listFolderContents(folderPath); // Recursively get folders and files
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


// Controller function to fetch folders by orgName
// Controller function to fetch folders by orgName
export const getFoldersByOrgHandler = async (req, res) => {
    const { orgName } = req.query; // Extract orgName from the query string

    if (!orgName) {
        return res.status(400).send({ error: 'Organization name is required.' });
    }

    try {
        const { folders, files } = await listFolderContents(orgName);
        res.status(200).send({ folders, files });
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).send({ error: 'Error fetching folders for the specified organization.' });
    }
};



//  new code for folders and subfolders

export const getAllProjectFolders = async (req, res) => {
    const { orgName } = req.params;  // orgName comes from the route parameter

    try {
        // Get all project folders from the service
        const folders = await s3Service.getAllProjectFolders(orgName);
        res.status(200).json(folders);  // Send the list of folders as a response
    } catch (error) {
        res.status(500).json({ error: `Error fetching project folders: ${error.message}` });
    }
};


// subfolders
export const getSubfoldersController = async (req, res) => {
    const { orgName, projectName } = req.params;
    try {
      // Use the correct function here to fetch the subfolders from S3
      const subfolders = await getSubfoldersForProject(orgName, projectName);
      
      res.json({ subfolders }); // Return the subfolders
    } catch (error) {
      console.error('Error fetching subfolders:', error);
      res.status(500).json({ error: 'Failed to fetch subfolders' });
    }
};

// Controller to handle folder creation
export const createFolderController = async (req, res) => {
    const { orgName, projectName } = req.body;

    if (!orgName || !projectName) {
        return res.status(400).json({ error: 'Organization name and project name are required' });
    }

    try {
        await createFolder(orgName, projectName);
        return res.status(200).json({ message: `Folder ${orgName}/${projectName} created successfully.` });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


// Controller to create subfolders inside an existing project folder
export const createSubfoldersController = async (req, res) => {
    const { orgName, projectName, subFolders } = req.body;

    // Validate the input fields
    if (!orgName || !projectName || !Array.isArray(subFolders) || subFolders.length === 0) {
        return res.status(400).json({ error: 'Organization name, project name, and subfolders are required' });
    }

    try {
        // Loop through the subfolders array and create each one inside the project folder
        for (const subfolderName of subFolders) {
            await createSubfolder(orgName, projectName, subfolderName); // Create subfolder inside the project folder
        }

        return res.status(200).json({ message: `Subfolders for ${orgName}/${projectName} created successfully.` });
    } catch (error) {
        console.error("Error creating subfolders:", error);
        return res.status(500).json({ error: error.message });
    }
};


// Controller to handle file upload
// Controller to handle file upload
export const uploadFileController = async (req, res) => {
    const { orgName, projectName, folderName } = req.body; // Extracting data from the request body

    // Validate inputs
    if (!orgName || !projectName || !folderName) {
        return res.status(400).json({ error: 'Organization name, project name, and folder name are required' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct the upload path for the file
    const uploadPath = `${orgName}/${projectName}/${folderName}/`; 
    console.log('Upload Path:', uploadPath);

    // Now upload the file to S3 (or other cloud storage)
    try {
        const s3 = new AWS.S3();
        const params = {
            Bucket: 'mediashippers-filestash', // Your S3 bucket name
            Key: `${uploadPath}${req.file.originalname}`, // Full path in the S3 bucket
            Body: req.file.buffer,  // File content
            ContentType: req.file.mimetype,
        };

        // Perform the upload
        const uploadResult = await s3.upload(params).promise();

        // Return success response with upload details
        return res.status(200).json({ message: 'File uploaded successfully!', data: uploadResult });
    } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).json({ error: error.message });
    }
};


// subfolder content code
// export const getSubfolderContentsController = async (req, res) => {
//   const { orgName, projectName, subfolderName } = req.params;

//   // Make sure the paths are properly concatenated without extra slashes
//   const folderPath = `${orgName}/${projectName}/${subfolderName}/`.replace(/\/+/g, '/'); // Replace multiple slashes with a single slash
//   console.log('Constructed folder path:', folderPath); // Log the folder path for debugging

//   try {
//     // Fetch project info from the database based on the projectName
//     const project = await ProjectInfo.findOne({ projectName });
//     console.log('Fetched project data:', project);

//     if (!project) {
//       return res.status(404).json({ error: 'Project not found' });
//     }

//     // Construct S3 file URLs for testing
//     const s3BaseURL = 'https://s3.eu-north-1.amazonaws.com/mediashippers-filestash/';
//     const fileNames = [
//       "APlaceAmongTheDead Fawesome_Portrait_2100x2700 copy.jpg",
//     ];
//     const fileURLs = fileNames.map(fileName => `${s3BaseURL}${orgName}/${projectName}/${subfolderName}/${fileName}`);

//     res.status(200).json({ files: fileURLs });
//   } catch (error) {
//     console.error('Error fetching subfolder contents:', error);
//     res.status(500).json({ error: 'Error fetching subfolder contents' });
//   }
// };


export const getSubfolderContentsController = async (req, res) => {
    try {
        // Log to console when the route is hit
        console.log('Testing: Received request for subfolder contents.');
        
        // Extract orgName, projectName, and subfolderName from request parameters
        const { orgName, projectName, subfolderName } = req.params;
        console.log('orgName:', orgName, 'projectName:', projectName, 'subfolderName:', subfolderName);

        // Simulate a response to return back to Postman
        res.json({
            success: true,
            message: `Successfully fetched contents for organization: ${orgName}, project: ${projectName}, and subfolder: ${subfolderName}`,
            orgName,
            projectName,
            subfolderName
        });
    } catch (error) {
        console.error('Error fetching subfolder contents:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching subfolder contents',
            errorDetails: error.message
        });
    }
};


export const getS3ObjByOrgHandler = async (req,res) => {
    console.log("Received request body:", req.body);
    const { path } = req.body;
    if (!path) {
        return res.status(400).send({ error: 'path name is required.' });
    }
    try {
        console.log("Calling listS3Contents with path:", path);
        const { folders, files }  = await listS3Contents(path);
        res.status(200).send({ folders, files });
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).send({ error: 'Error fetching folders for the specified organization.' });
    }
};


export const getProjectInfoById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const project = await ProjectInfo.findById(id);
  
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
  
      const { _id, projectTitle, projectPoster, trailerFile } = project;
  
      res.status(200).json({
        _id,
        projectTitle,
        projectPoster,
        trailerFile,
      });
    } catch (error) {
      console.error('Error fetching project info by ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  