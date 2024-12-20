import ProjectFormService from "../services/projectFormService.js"; // Adjust path as necessary

const projectFormController = {
    createProject: async (req, res) => {
        try {
          const { projectInfo, submitterInfo, creditsInfo, specificationsInfo, screeningsInfo } = req.body;
      
          // Validate the required field for projectTitle only
          if (!projectInfo.projectTitle) {
            return res.status(400).json({ error: 'Project Title is required' });
          }
      
          // If the projectType is optional, you can safely ignore its validation
          // (no need to check if projectType exists anymore)
      
          const newProjectForm = await ProjectFormService.createProjectForm(
            projectInfo,
            submitterInfo,
            creditsInfo,
            specificationsInfo,
            screeningsInfo
          );
      
          res.status(201).json(newProjectForm);
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Internal server error' });
        }
      },

  getAllProjects: async (req, res) => {
    try {
      const projects = await ProjectFormService.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getProjectById: async (req, res) => {
    try {
      const { id } = req.params;
      const project = await ProjectFormService.getProjectById(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  updateProject: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedProjectForm = await ProjectFormService.updateProjectForm(id, req.body);
      res.json(updatedProjectForm);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteProject: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedProjectForm = await ProjectFormService.deleteProjectForm(id);
      if (!deletedProjectForm) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export default projectFormController;
