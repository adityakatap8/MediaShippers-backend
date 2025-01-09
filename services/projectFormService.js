import mongoose from "mongoose";
import ProjectForm from "../models/projectFormModels/ProjectForm.js";
import ProjectInfoSchema from "../models/projectFormModels/FormModels/ProjectInfoSchema.js";
import SubmitterInfoSchema from "../models/projectFormModels/FormModels/SubmitterInfoSchema.js";
import CreditsInfoSchema from "../models/projectFormModels/FormModels/CreditsInfoSchema.js";
import SpecificationsInfo from "../models/projectFormModels/FormModels/SpecificationsInfo.js";
import ScreeningsInfo from "../models/projectFormModels/FormModels/ScreeningInfoSchema.js";

const projectFormService = {
  createProjectForm: async (projectInfo, submitterInfo, creditsInfo, specificationsInfo, screeningsInfo) => {
    try {
      let screeningsInfoIds = [];
      if (Array.isArray(screeningsInfo) && screeningsInfo.length > 0) {
        screeningsInfoIds = await Promise.all(
          screeningsInfo.map(async (screening) => {
            const screeningsInfoDoc = new ScreeningsInfo(screening);
            await screeningsInfoDoc.save();
            return screeningsInfoDoc._id;
          })
        );
      }

      const projectInfoDoc = new ProjectInfoSchema(projectInfo);
      const submitterInfoDoc = new SubmitterInfoSchema(submitterInfo);
      const creditsInfoDoc = new CreditsInfoSchema(creditsInfo);
      const specificationsInfoDoc = new SpecificationsInfo(specificationsInfo);

      await projectInfoDoc.save();
      await submitterInfoDoc.save();
      await creditsInfoDoc.save();
      await specificationsInfoDoc.save();

      const projectFormDoc = new ProjectForm({
        projectInfo: projectInfoDoc._id,
        submitterInfo: submitterInfoDoc._id,
        creditsInfo: creditsInfoDoc._id,
        specificationsInfo: specificationsInfoDoc._id,
        screeningsInfo: screeningsInfoIds,
      });

      await projectFormDoc.save();
      return projectFormDoc;
    } catch (error) {
      console.error("Error creating project form:", error.message);
      throw new Error("Error saving project form: " + error.message);
    }
  },

  getAllProjects: async () => {
    try {
      return await ProjectInfoSchema.find();
    } catch (error) {
      console.error("Error fetching projects:", error.message);
      throw new Error("Error fetching projects");
    }
  },

  getProjectById: async (id) => {
    try {
      return await ProjectForm.findById(id).populate(
        "projectInfo submitterInfo creditsInfo specificationsInfo screeningsInfo"
      );
    } catch (error) {
      console.error("Error fetching project by ID:", error.message);
      throw new Error("Error fetching project by ID");
    }
  },

  updateProjectForm: async (id, updateData) => {
    try {
      return await ProjectForm.findByIdAndUpdate(id, updateData, { new: true }).populate(
        "projectInfo submitterInfo creditsInfo specificationsInfo screeningsInfo"
      );
    } catch (error) {
      console.error("Error updating project form:", error.message);
      throw new Error("Error updating project form");
    }
  },

  deleteProjectForm: async (id) => {
    try {
      return await ProjectForm.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error deleting project form:", error.message);
      throw new Error("Error deleting project form");
    }
  },

  getProjectFormByProjectId: async (projectInfoId) => {
    try {
      const id = mongoose.Types.ObjectId(projectInfoId);
      return await ProjectForm.findOne({ projectInfo: id });
    } catch (error) {
      console.error("Error fetching project form by project ID:", error.message);
      throw new Error("Error fetching project form by project ID");
    }
  },

  getProjectInfo: async (projectInfoId) => {
    try {
      const id = mongoose.Types.ObjectId(projectInfoId);
      return await ProjectInfoSchema.findById(id);
    } catch (error) {
      console.error("Error fetching project info by ID:", error.message);
      throw new Error("Error fetching project info by ID");
    }
  },
   findProjectFormByProjectInfo : async (projectInfo) => {
    return await ProjectForm.findOne({ projectInfo: mongoose.Types.ObjectId(projectInfo) });
  }
};

export default projectFormService;
