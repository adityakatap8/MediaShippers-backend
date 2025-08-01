import ProjectFormService from "../services/projectFormService.js";
import mongoose from "mongoose";

const projectFormController = {
  // Method to create an ObjectId from a string
  createObjectId: (id) => {
    return typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;
  },

  // Create a new project form combined components info is shared using this code
  // project forms create project controller
  createProject: async (req, res) => {
    console.log("🟢 Inside createProject controller ====>");

    try {
      let {
        projectInfo,
        creditsInfo,
        specificationsInfo,
        rightsInfo,
        userId,
      } = req.body;

      // Parse potentially stringified fields from multipart/form-data
      let srtInfo = typeof req.body.srtInfo === 'string' ? JSON.parse(req.body.srtInfo) : req.body.srtInfo;
      let dubbedFiles = typeof req.body.dubbedFiles === 'string' ? JSON.parse(req.body.dubbedFiles) : req.body.dubbedFiles;

      console.log("📜 Received projectInfo:", JSON.stringify(projectInfo ?? {}, null, 2));
      console.log("📜 Received creditsInfo:", JSON.stringify(creditsInfo ?? {}, null, 2));
      console.log("📜 Received specificationsInfo:", JSON.stringify(specificationsInfo ?? {}, null, 2));
      console.log("📜 Received rightsInfo:", JSON.stringify(rightsInfo ?? {}, null, 2));
      console.log("📜 Received srtInfo:", JSON.stringify(srtInfo ?? {}, null, 2));
      console.log("🎧 Received dubbedFiles:", JSON.stringify(dubbedFiles ?? {}, null, 2));

      // ✅ Normalize srtInfo
      let srtPayload = {};
      if (srtInfo?.srtFiles || srtInfo?.infoDocuments) {
        srtPayload = srtInfo;
      } else if (srtInfo?.srtInfo) {
        srtPayload = srtInfo.srtInfo;
      } else {
        console.warn("⚠️ No srtInfo provided. Proceeding with empty payload.");
        srtPayload = { srtFiles: [], infoDocuments: [] };
      }

      // Defensive checks
      if (!Array.isArray(srtPayload.srtFiles)) srtPayload.srtFiles = [];
      if (!Array.isArray(srtPayload.infoDocuments)) srtPayload.infoDocuments = [];

      // ✅ Normalize dubbedFiles
      const normalizedDubbedFiles = Array.isArray(dubbedFiles?.dubbedFiles)
        ? dubbedFiles.dubbedFiles
        : Array.isArray(dubbedFiles)
          ? dubbedFiles
          : [];

      console.log("🧪 Normalized srtPayload:", JSON.stringify(srtPayload ?? {}, null, 2));
      console.log("🧪 Normalized dubbedFiles:", JSON.stringify(normalizedDubbedFiles ?? [], null, 2));

      // ✅ Basic validation
      if (!projectInfo || !projectInfo.projectTitle) {
        return res.status(400).json({ error: "Project Title is required" });
      }

      // ✅ Delegate to service
      const newProjectForm = await ProjectFormService.createProjectForm(
        projectInfo,
        creditsInfo,
        specificationsInfo,
        rightsInfo,
        srtPayload,
        normalizedDubbedFiles,
        userId
      );

      return res.status(201).json({
        message: "✅ Project form created successfully",
        project: newProjectForm,
      });
    } catch (error) {
      console.error("❌ Error creating project:", error);
      return res.status(500).json({ error: "Internal server error", details: error.message });
    }
  }
  ,


  // Get all project forms
  getAllProjects: async (req, res) => {
    try {
      const projects = await ProjectFormService.getAllProjects();
      if (projects.length === 0) {
        return res.status(404).json({ error: "No projects found" });
      }
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getUserProjects: async (req, res) => {
    console.log("inside getUserProjects ====>");
    try {
      console.log("req ==>", req.params);
      console.log("req ==>", req.params.id);
      console.log("req headers ==>", req.headers);
      const userProjects = await ProjectFormService.getUserProjects(req.params.id);
      console.log("userProjects ==>", userProjects);
      if (userProjects.length === 0) {
        return res.status(404).json({ error: "No projects found" });
      }
      res.json(userProjects);
    } catch (error) {
      console.error("Error fetching projects:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // bulk upload controller
// bulk upload controller
// controllers/projectFormController.js
bulkCreateProject: async (req, res) => {
  try {
    const { userId, projects } = req.body;

    if (!userId || typeof userId !== 'string' || !Array.isArray(projects)) {
      return res.status(400).json({ error: 'Missing or invalid userId or projects array.' });
    }

    const result = await ProjectFormService.bulkCreateProjectForms(projects, userId);

    return res.status(201).json({
      message: result.message,
      count: result.count,
      projects: result.projects,
      skipped: result.skipped,
    });
  } catch (error) {
    console.error("❌ Error in bulkCreateProject:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
  ,



  // Get a project form by ID
  getProjectById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }

      const projectForm = await ProjectFormService.getProjectById(id);

      if (!projectForm) {
        return res.status(404).json({ error: "Project not found" });
      }

      const populatedProject = await projectForm.populate([
        { path: "projectInfo", select: "_id projectTitle" },
        { path: "submitterInfo", select: "_id submitterName" },
        { path: "creditsInfo", select: "_id director producer" },
        { path: "specificationsInfo", select: "_id format length" },
        { path: "screeningsInfo", select: "_id date location" },
        { path: "rightsInfo", select: "_id rightsHolder license" }, // Added rightsInfo population
      ]);

      res.json(populatedProject);
    } catch (error) {
      console.error("Error fetching project by ID:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Update a project form
  updateProject: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }

      const updatedProject = await ProjectFormService.updateProjectForm(id, req.body);

      if (!updatedProject) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Delete a project form
  deleteProject: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid project ID format" });
      }

      const deletedProject = await ProjectFormService.deleteProjectForm(id);

      if (!deletedProject) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Check if a project form exists by projectInfo ID
  getProjectFormExists: async (req, res) => {
    try {
      const { projectInfo } = req.params;

      if (!mongoose.Types.ObjectId.isValid(projectInfo)) {
        return res.status(400).json({ error: "Invalid projectInfo ID format" });
      }

      const projectForm = await ProjectFormService.findProjectFormByProjectInfo(projectInfo);

      res.status(200).json({ exists: !!projectForm });
    } catch (error) {
      console.error("Error checking projectInfo in projectForms:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

export default projectFormController;
