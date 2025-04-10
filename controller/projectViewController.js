import mongoose from "mongoose";
import ProjectFormService from "../services/projectFormService.js";

const projectViewController = {
  getProjectViewById: async (req, res) => {
    try {
      const { id } = req.params;

      // Validate the ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }

      // Verify if the ID exists in the projectForms collection
      const projectForm = await ProjectFormService.getProjectById(id);
      if (!projectForm) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Populate all nested fields
      const populatedProject = await projectForm.populate([
        { path: 'projectInfo', select: '_id title' },
        { path: 'submitterInfo', select: 'submitterName' },
        { path: 'creditsInfo', select: 'director producer' },
        { path: 'specificationsInfo', select: 'specifications' },
        { path: 'screeningsInfo', select: 'screenings' },
      ]).exec(); // Don't forget to call exec()

      res.json(populatedProject);
    } catch (error) {
      console.error("Error fetching project by ID:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

export default projectViewController;
