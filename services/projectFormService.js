// import mongoose from "mongoose";
// import ProjectForm from "../models/projectFormModels/ProjectForm.js";
// import ProjectInfoSchema from "../models/projectFormModels/FormModels/ProjectInfoSchema.js";
// import SubmitterInfoSchema from "../models/projectFormModels/FormModels/SubmitterInfoSchema.js";
// import CreditsInfoSchema from "../models/projectFormModels/FormModels/CreditsInfoSchema.js";
// import SpecificationsInfo from "../models/projectFormModels/FormModels/SpecificationsInfo.js";
// import ScreeningsInfo from "../models/projectFormModels/FormModels/ScreeningInfoSchema.js";

// const projectFormService = {
//   createProjectForm: async (projectInfo, submitterInfo, creditsInfo, specificationsInfo, screeningsInfo, userId) => {
//     console.log("inside projectFormService ====>");
//     console.log("userId passed ====>", userId);  // Log userId for debugging
//     try {
//       let screeningsInfoIds = [];
//       if (Array.isArray(screeningsInfo) && screeningsInfo.length > 0) {
//         screeningsInfoIds = await Promise.all(
//           screeningsInfo.map(async (screening) => {
//             const screeningsInfoDoc = new ScreeningsInfo(screening);
//             await screeningsInfoDoc.save();
//             return screeningsInfoDoc._id;
//           })
//         );
//       }

//       // Validate userId format (it's a string here, which is UUID)
//       if (!userId || typeof userId !== 'string' || userId.length !== 36) {
//         console.log("Invalid userId format", userId);  // Log error if invalid
//         throw new Error('Invalid userId format');
//       }

//       const projectData = { ...projectInfo, userId };  // No need to convert to ObjectId
//       console.log("projectData ====>", projectData);

//       const projectInfoDoc = new ProjectInfoSchema(projectData);
//       const submitterInfoDoc = new SubmitterInfoSchema(submitterInfo);
//       const creditsInfoDoc = new CreditsInfoSchema(creditsInfo);
//       const specificationsInfoDoc = new SpecificationsInfo(specificationsInfo);

//       await projectInfoDoc.save();
//       await submitterInfoDoc.save();
//       await creditsInfoDoc.save();
//       await specificationsInfoDoc.save();

//       const projectFormDoc = new ProjectForm({
//         projectInfo: projectInfoDoc._id,
//         submitterInfo: submitterInfoDoc._id,
//         creditsInfo: creditsInfoDoc._id,
//         specificationsInfo: specificationsInfoDoc._id,
//         screeningsInfo: screeningsInfoIds,
//       });

//       await projectFormDoc.save();
//       return projectFormDoc;
//     } catch (error) {
//       console.error("Error creating project form:", error.message);
//       throw new Error("Error saving project form: " + error.message);
//     }
//   },

//   getAllProjects: async () => {
//     try {
//       return await ProjectInfoSchema.find();
//     } catch (error) {
//       console.error("Error fetching projects:", error.message);
//       throw new Error("Error fetching projects");
//     }
//   },

//   getUserProjects: async (id) => {
//     console.log("inside getUserProjects ====>", id);
//     let result = id.trim();
//     try {
//       return await ProjectInfoSchema.find({ userId: result });
//     } catch (error) {
//       console.error("Error fetching projects:", error.message);
//       throw new Error("Error fetching projects");
//     }
//   },

//   getProjectById: async (id) => {
//     try {
//       let projectId;
//       if (typeof id === 'string') {
//         // Assuming it's already a valid ObjectId string
//         projectId = mongoose.Types.ObjectId(id);
//       } else if (id instanceof mongoose.Types.ObjectId) {
//         // If it's already an ObjectId instance
//         projectId = id;
//       } else {
//         throw new Error('Invalid project ID format');
//       }
  
//       // First, find the project form document
//       const projectForm = await ProjectForm.findOne({ projectInfo: projectId });
      
//       if (!projectForm) {
//         return null;
//       }
  
//       // Then, populate the nested documents
//       return await projectForm.populate({
//         path: ['projectInfo', 'submitterInfo', 'creditsInfo', 'specificationsInfo', 'screeningsInfo'],
//         select: '_id title submitterName credits director producer specifications screenings'
//       }).exec();
//     } catch (error) {
//       console.error("Error fetching project by ID:", error.message);
//       throw new Error("Error fetching project by ID");
//     }
//   },

//   updateProjectForm: async (id, updateData) => {
//     try {
//       return await ProjectForm.findByIdAndUpdate(id, updateData, { new: true }).populate(
//         "projectInfo submitterInfo creditsInfo specificationsInfo screeningsInfo"
//       );
//     } catch (error) {
//       console.error("Error updating project form:", error.message);
//       throw new Error("Error updating project form");
//     }
//   },

//   deleteProjectForm: async (id) => {
//     try {
//       return await ProjectForm.findByIdAndDelete(id);
//     } catch (error) {
//       console.error("Error deleting project form:", error.message);
//       throw new Error("Error deleting project form");
//     }
//   },

//   getProjectFormByProjectId: async (projectInfoId) => {
//     try {
//       const id = mongoose.Types.ObjectId(projectInfoId);
//       return await ProjectForm.findOne({ projectInfo: id });
//     } catch (error) {
//       console.error("Error fetching project form by project ID:", error.message);
//       throw new Error("Error fetching project form by project ID");
//     }
//   },

//   getProjectInfo: async (projectInfoId) => {
//     try {
//       const id = mongoose.Types.ObjectId(projectInfoId);
//       return await ProjectInfoSchema.findById(id);
//     } catch (error) {
//       console.error("Error fetching project info by ID:", error.message);
//       throw new Error("Error fetching project info by ID");
//     }
//   },

//   findProjectFormByProjectInfo: async (projectInfo) => {
//     try {
//       const id = mongoose.Types.ObjectId(projectInfo);
//       return await ProjectForm.findOne({ projectInfo: id });
//     } catch (error) {
//       console.error("Error finding project form by projectInfo:", error.message);
//       throw new Error("Error finding project form by projectInfo");
//     }
//   },
// };

// export default projectFormService;

import mongoose from "mongoose";
import ProjectForm from "../models/projectFormModels/ProjectForm.js";
import ProjectInfoSchema from "../models/projectFormModels/FormModels/ProjectInfoSchema.js";
import SubmitterInfoSchema from "../models/projectFormModels/FormModels/SubmitterInfoSchema.js";
import CreditsInfoSchema from "../models/projectFormModels/FormModels/CreditsInfoSchema.js";
import SpecificationsInfo from "../models/projectFormModels/FormModels/SpecificationsInfo.js";
import ScreeningsInfo from "../models/projectFormModels/FormModels/ScreeningInfoSchema.js";
import RightsInfo from "../models/projectFormModels/FormModels/RightsInfoSchema.js"; // Import the RightsInfo model

const projectFormService = {
  // Create a new project form with associated individual components
  createProjectForm: async (projectInfo, submitterInfo, creditsInfo, specificationsInfo, screeningsInfo, rightsInfo, userId) => {
    console.log("inside projectFormService ====>");
    console.log("userId passed ====>", userId);  // Log userId for debugging

    try {
      // Handle screenings info array if provided
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

      // Handle rights info array if provided
      let rightsInfoIds = [];
      if (Array.isArray(rightsInfo) && rightsInfo.length > 0) {
        rightsInfoIds = await Promise.all(
          rightsInfo.map(async (right) => {
            const rightsInfoDoc = new RightsInfo(right);
            await rightsInfoDoc.save();
            return rightsInfoDoc._id;
          })
        );
      }

      // Validate userId format (it’s a string here, which is UUID)
      if (!userId || typeof userId !== 'string' || userId.length !== 36) {
        console.log("Invalid userId format", userId);  // Log error if invalid
        throw new Error('Invalid userId format');
      }

      const projectData = { ...projectInfo, userId };  // No need to convert to ObjectId
      console.log("projectData ====>", projectData);

      // Create and save individual form components
      const projectInfoDoc = new ProjectInfoSchema(projectData);
      const submitterInfoDoc = new SubmitterInfoSchema(submitterInfo);
      const creditsInfoDoc = new CreditsInfoSchema(creditsInfo);
      const specificationsInfoDoc = new SpecificationsInfo(specificationsInfo);

      await projectInfoDoc.save();
      await submitterInfoDoc.save();
      await creditsInfoDoc.save();
      await specificationsInfoDoc.save();

      // Create the project form and associate it with the above documents, including rightsInfo
      const projectFormDoc = new ProjectForm({
        projectInfo: projectInfoDoc._id,
        submitterInfo: submitterInfoDoc._id,
        creditsInfo: creditsInfoDoc._id,
        specificationsInfo: specificationsInfoDoc._id,
        screeningsInfo: screeningsInfoIds,
        rightsInfo: rightsInfoIds,  // Associate rightsInfo with the project form
      });

      await projectFormDoc.save();
      return projectFormDoc;
    } catch (error) {
      console.error("Error creating project form:", error.message);
      throw new Error("Error saving project form: " + error.message);
    }
  },

  // Get all projects
  getAllProjects: async () => {
    try {
      return await ProjectInfoSchema.find();
    } catch (error) {
      console.error("Error fetching projects:", error.message);
      throw new Error("Error fetching projects");
    }
  },

  // Get all projects for a specific user
  getUserProjects: async (id) => {
    console.log("inside getUserProjects ====>", id);
    let result = id.trim();
    try {
      return await ProjectInfoSchema.find({ userId: result });
    } catch (error) {
      console.error("Error fetching projects:", error.message);
      throw new Error("Error fetching projects");
    }
  },

  // Get a project form by ID, with population of related components
  getProjectById: async (id) => {
    try {
      let projectId;
      if (typeof id === 'string') {
        // Assuming it's already a valid ObjectId string
        projectId = mongoose.Types.ObjectId(id);
      } else if (id instanceof mongoose.Types.ObjectId) {
        // If it's already an ObjectId instance
        projectId = id;
      } else {
        throw new Error('Invalid project ID format');
      }

      // Find the project form document by projectInfo
      const projectForm = await ProjectForm.findOne({ projectInfo: projectId });

      if (!projectForm) {
        return null;
      }

      // Populate all the relevant fields and return the populated document
      return await projectForm.populate({
        path: ['projectInfo', 'submitterInfo', 'creditsInfo', 'specificationsInfo', 'screeningsInfo', 'rightsInfo'],  // Populate rightsInfo as well
        select: '_id title submitterName credits director producer specifications screenings rightsInfo'  // Make sure to include rightsInfo
      }).exec();
    } catch (error) {
      console.error("Error fetching project by ID:", error.message);
      throw new Error("Error fetching project by ID");
    }
  },

  // Update the project form with new data
  updateProjectForm: async (id, updateData) => {
    try {
      return await ProjectForm.findByIdAndUpdate(id, updateData, { new: true }).populate(
        "projectInfo submitterInfo creditsInfo specificationsInfo screeningsInfo rightsInfo"  // Include rightsInfo in population
      );
    } catch (error) {
      console.error("Error updating project form:", error.message);
      throw new Error("Error updating project form");
    }
  },

  // Delete a project form and its associated components
  deleteProjectForm: async (id) => {
    try {
      const projectForm = await ProjectForm.findById(id);

      if (!projectForm) {
        throw new Error("Project form not found");
      }

      // Delete associated components if they exist
      await ProjectInfoSchema.findByIdAndDelete(projectForm.projectInfo);
      await SubmitterInfoSchema.findByIdAndDelete(projectForm.submitterInfo);
      await CreditsInfoSchema.findByIdAndDelete(projectForm.creditsInfo);
      await SpecificationsInfo.findByIdAndDelete(projectForm.specificationsInfo);

      // Delete screenings if they exist
      if (Array.isArray(projectForm.screeningsInfo) && projectForm.screeningsInfo.length > 0) {
        await ScreeningsInfo.deleteMany({ _id: { $in: projectForm.screeningsInfo } });
      }

      // Delete rightsInfo if they exist
      if (Array.isArray(projectForm.rightsInfo) && projectForm.rightsInfo.length > 0) {
        await RightsInfo.deleteMany({ _id: { $in: projectForm.rightsInfo } });
      }

      // Finally delete the project form itself
      await ProjectForm.findByIdAndDelete(id);

      return { message: "Project form and its components successfully deleted." };
    } catch (error) {
      console.error("Error deleting project form:", error.message);
      throw new Error("Error deleting project form");
    }
  },

  // Get a project form by the projectInfo ID
  getProjectFormByProjectId: async (projectInfoId) => {
    try {
      const id = mongoose.Types.ObjectId(projectInfoId);
      return await ProjectForm.findOne({ projectInfo: id });
    } catch (error) {
      console.error("Error fetching project form by project ID:", error.message);
      throw new Error("Error fetching project form by project ID");
    }
  },

  // Get project info by ID
  getProjectInfo: async (projectInfoId) => {
    try {
      const id = mongoose.Types.ObjectId(projectInfoId);
      return await ProjectInfoSchema.findById(id);
    } catch (error) {
      console.error("Error fetching project info by ID:", error.message);
      throw new Error("Error fetching project info by ID");
    }
  },

  // Find a project form by projectInfo (essentially the reverse lookup)
  findProjectFormByProjectInfo: async (projectInfo) => {
    try {
      const id = mongoose.Types.ObjectId(projectInfo);
      return await ProjectForm.findOne({ projectInfo: id });
    } catch (error) {
      console.error("Error finding project form by projectInfo:", error.message);
      throw new Error("Error finding project form by projectInfo");
    }
  },
};

export default projectFormService;
