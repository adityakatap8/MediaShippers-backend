import ProjectFormService from "../services/projectFormService.js";
import mongoose from "mongoose";

const projectFormController = {
  // Method to create an ObjectId from a string
  createObjectId: (id) => {
    return typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;
  },

  // Create a new project form combined components info is shared using this code
  createProject: async (req, res) => {
    console.log("inside createProject ====>");
    try {
      const { projectInfo, submitterInfo, creditsInfo, specificationsInfo, screeningsInfo, rightsInfo, userId } = req.body; // Added rightsInfo

      if (!projectInfo || !projectInfo.projectTitle) {
        return res.status(400).json({ error: "Project Title is required" });
      }

      const newProjectForm = await ProjectFormService.createProjectForm(
        projectInfo,
        submitterInfo,
        creditsInfo,
        specificationsInfo,
        screeningsInfo,
        rightsInfo,  // Passed rightsInfo here
        userId
      );

      res.status(201).json(newProjectForm);
    } catch (error) {
      console.error("Error creating project:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },

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
