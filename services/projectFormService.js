import ProjectForm from "../models/projectFormModels/ProjectForm.js";  // Adjust path as necessary
import ProjectInfoSchema from "../models/projectFormModels/FormModels/ProjectInfoSchema.js";
import SubmitterInfoSchema from "../models/projectFormModels/FormModels/SubmitterInfoSchema.js";
import CreditsInfoSchema from "../models/projectFormModels/FormModels/CreditsInfoSchema.js";
import SpecificationsInfo from "../models/projectFormModels/FormModels/SpecificationsInfo.js";
import ScreeningInfoSchema from "../models/projectFormModels/FormModels/ScreeningInfoSchema.js";

const projectFormService = {
  // Create a new project form
  createProjectForm: async (projectInfo, submitterInfo, creditsInfo, specificationsInfo, screeningsInfo) => {
    try {
      // Validate submitterInfo to ensure it's not empty
      if (!submitterInfo || Object.keys(submitterInfo).length === 0) {
        throw new Error('Submitter information is missing or invalid');
      }

      // Log the submitterInfo to check if it's being passed correctly
      console.log('submitterInfo:', submitterInfo);

      // Save individual sub-documents and get their references
      const projectInfoDoc = new ProjectInfoSchema(projectInfo);
      const submitterInfoDoc = new SubmitterInfoSchema(submitterInfo);
      const creditsInfoDoc = new CreditsInfoSchema(creditsInfo);
      const specificationsInfoDoc = new SpecificationsInfo(specificationsInfo);

      // Ensure screeningsInfo is an array, or default to an empty array
      const screeningsArray = Array.isArray(screeningsInfo) ? screeningsInfo : [];

      // Save screening info sub-documents if present
      const screeningsInfoDocs = await Promise.all(
        screeningsArray.map((screening) => new ScreeningInfoSchema(screening).save())
      );

      // Save the main ProjectForm document with references to the sub-documents
      const projectFormDoc = new ProjectForm({
        projectInfo: projectInfoDoc._id,
        submitterInfo: submitterInfoDoc._id,
        creditsInfo: creditsInfoDoc._id,
        specificationsInfo: specificationsInfoDoc._id,
        screeningsInfo: screeningsInfoDocs.map(doc => doc._id)  // Reference to screening documents
      });

      // Save all sub-documents and the main project form document
      await projectInfoDoc.save();
      await submitterInfoDoc.save();
      await creditsInfoDoc.save();
      await specificationsInfoDoc.save();
      await projectFormDoc.save();

      return projectFormDoc; // Return the saved project form document
    } catch (error) {
      console.error('Error creating project form:', error.message);
      throw new Error("Error saving project form: " + error.message);
    }
  },

  // Get all projects
  getAllProjects: async () => {
    try {
      const projects = await ProjectForm.find()
        .populate('projectInfo submitterInfo creditsInfo specificationsInfo screeningsInfo'); // Populate all references
      return projects;
    } catch (error) {
      console.error('Error fetching all projects:', error.message);
      throw new Error("Error fetching all projects");
    }
  },

  // Get a project by ID
  getProjectById: async (id) => {
    try {
      const project = await ProjectForm.findById(id)
        .populate('projectInfo submitterInfo creditsInfo specificationsInfo screeningsInfo'); // Populate references
      return project;
    } catch (error) {
      console.error('Error fetching project by ID:', error.message);
      throw new Error("Error fetching project by ID");
    }
  },

  // Update a project by ID
  updateProjectForm: async (id, updateData) => {
    try {
      const updatedProject = await ProjectForm.findByIdAndUpdate(
        id,
        updateData,
        { new: true } // Return the updated document
      ).populate('projectInfo submitterInfo creditsInfo specificationsInfo screeningsInfo');
      return updatedProject;
    } catch (error) {
      console.error('Error updating project form:', error.message);
      throw new Error("Error updating project form");
    }
  },

  // Delete a project by ID
  deleteProjectForm: async (id) => {
    try {
      const deletedProject = await ProjectForm.findByIdAndDelete(id);
      return deletedProject;
    } catch (error) {
      console.error('Error deleting project form:', error.message);
      throw new Error("Error deleting project form");
    }
  }
};

export default projectFormService;
