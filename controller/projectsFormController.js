import ProjectFormService from "../services/projectFormService.js";
import mongoose from "mongoose";

const projectFormController = {
  createProject: async (req, res) => {
    try {
      const { projectInfo, submitterInfo, creditsInfo, specificationsInfo, screeningsInfo } = req.body;

      if (!projectInfo || !projectInfo.projectTitle) {
        return res.status(400).json({ error: "Project Title is required" });
      }

      const newProjectForm = await ProjectFormService.createProjectForm(
        projectInfo,
        submitterInfo,
        creditsInfo,
        specificationsInfo,
        screeningsInfo
      );

      res.status(201).json(newProjectForm);
    } catch (error) {
      console.error("Error creating project:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },

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

  getProjectById: async (req, res) => {
    try {
      const { id } = req.params;
      const project = await ProjectFormService.getProjectById(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project by ID:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  updateProject: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedProject = await ProjectFormService.updateProjectForm(id, req.body);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  deleteProject: async (req, res) => {
    try {
      const { id } = req.params;
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

  getProjectFormExists: async (req, res) => {
    try {
      const { projectInfo } = req.params; // Get the projectInfo ID from the request params
      
      // Validate the ObjectId format
      if (!mongoose.Types.ObjectId.isValid(projectInfo)) {
        return res.status(400).json({ error: "Invalid projectInfo ID format" });
      }
  
      // Search for the project form by projectInfo
      const projectForm = await ProjectFormService.findProjectFormByProjectInfo(projectInfo);
  
      if (projectForm) {
        // If the project form exists, return success
        return res.status(200).json({ exists: true });
      } else {
        // If no matching project form is found
        return res.status(404).json({ exists: false });
      }
    } catch (error) {
      console.error("Error checking projectInfo in projectForms:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  }
  ,
};

export default projectFormController;
