import { MongoClient, ObjectId } from 'mongodb';
import ProjectFormViewerService from '../services/projectFormViewerService.js';
import multer from "multer";

// Multer storage configuration (same as above)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(file.mimetype);
  const mimetype = fileTypes.test(file.originalname.toLowerCase());

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// MongoDB URI setup (same as before)
const uri = "mongodb+srv://prernajain:prerna@cluster0.1cmgs5b.mongodb.net/shipmediademo";
const dbName = "shipmediademo";
const collectionName = "projectforms";

const projectFormDataController = {
  // Fetch project form data
  getProjectFormData: async (req, res) => {
    const client = new MongoClient(uri);

    try {
      let { id: projectId } = req.params;
      projectId = projectId.trim();

      if (!ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const projectInfoId = new ObjectId(projectId);
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      // Query the data
      const rawResult = await collection.findOne({ projectInfo: projectInfoId });

      const projectData = await ProjectFormViewerService.getProjectFormData(projectId);

      const populatedProject = {
        ...projectData,
        projectInfo: await collection.findOne({ _id: projectData.projectInfo }),
        submitterInfo: await collection.findOne({ _id: projectData.submitterInfo }),
        creditsInfo: await collection.findOne({ _id: projectData.creditsInfo }),
        specificationsInfo: await collection.findOne({ _id: projectData.specificationsInfo }),
      };

      res.json(populatedProject);
    } catch (error) {
      console.error("Error fetching project data:", error.message);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      await client.close();
    }
  },

  // Update project form data
  updateProjectFormData: async (req, res) => {
    const client = new MongoClient(uri);

    try {
      const { id: projectId, section } = req.params;
      const updateData = req.body;

      if (!ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }

      if (!section || typeof section !== "string") {
        return res.status(400).json({ error: "Invalid section identifier" });
      }

      const projectInfoId = new ObjectId(projectId);
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      // Define section mappings
      const sectionMappings = {
        projectInfo: "projectInfo",
        submitterInfo: "submitterInfo",
        creditsInfo: "creditsInfo",
        specificationsInfo: "specificationsInfo",
        screeningsInfo: "screeningsInfo",
      };

      if (!sectionMappings[section]) {
        return res.status(400).json({ error: "Invalid section name" });
      }

      const updateField = sectionMappings[section];

      const updateResult = await collection.updateOne(
        { projectInfo: projectInfoId },
        { $set: { [`${updateField}`]: updateData } }
      );

      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json({ message: `${section} updated successfully` });
    } catch (error) {
      console.error("Error updating project data:", error.message);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      await client.close();
    }
  },

  // Handle file upload
  uploadProjectFile: upload.single("projectFile"), // Single file upload handling
  // You can add more multer upload methods if you need multiple file uploads or other configurations

  // Fetch only specifications info by project ID
  getSpecificationsInfo: async (req, res) => {
    const client = new MongoClient(uri);

    try {
      let { id: projectId } = req.params;
      projectId = projectId.trim();

      if (!ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      const projectInfoId = new ObjectId(projectId);
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection(collectionName);

      const rawResult = await collection.findOne({ projectInfo: projectInfoId }, { projection: { specificationsInfo: 1 } });

      if (!rawResult || !rawResult.specificationsInfo) {
        return res.status(404).json({ error: "Specifications info not found" });
      }

      res.json(rawResult.specificationsInfo);
    } catch (error) {
      console.error("Error fetching specifications info:", error.message);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      await client.close();
    }
  },
};

export default projectFormDataController;
