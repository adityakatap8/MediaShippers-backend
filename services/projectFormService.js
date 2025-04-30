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
import RightsInfoGroup from "../models/projectFormModels/FormModels/RightsInfoSchema.js";
import SrtInfoFileSchema from "../models/projectFormModels/FormModels/SrtInfoFileSchema.js";

const projectFormService = {
 
  createProjectForm: async (
    projectInfo,
    creditsInfo,
    specificationsInfo,
    screeningsInfo,
    rightsInfo,
    srtInfo,  // Now this is the combined object with srtFiles and infoDocuments
    userId
  ) => {
    try {
      const cleanUserId =
        typeof userId === "string" && userId.trim()
          ? userId.trim()
          : projectInfo?.userId?.trim?.() || "";
  
      if (!cleanUserId) {
        throw new Error("userId is missing or invalid.");
      }
  
      const normalizeFileName = (file) => {
        if (typeof file === "object" && file?.filePath) {
          return file.filePath.split("/").pop();
        }
        if (typeof file === "string") {
          return file;
        }
        return "";
      };
  
      const projectData = {
        ...projectInfo,
        userId: cleanUserId,
        posterFileName: normalizeFileName(projectInfo.posterFileName),
        bannerFileName: normalizeFileName(projectInfo.bannerFileName),
        trailerFileName: normalizeFileName(projectInfo.trailerFileName),
        movieFileName: normalizeFileName(projectInfo.movieFileName),
      };
  
      // Save screenings
      let screeningsInfoDocs = [];
      if (Array.isArray(screeningsInfo)) {
        screeningsInfoDocs = await Promise.all(
          screeningsInfo.map(async (screening) => {
            const doc = new ScreeningsInfo(screening);
            await doc.save();
            return doc._id;
          })
        );
      }
  
      // Save rights info
      let rightsInfoDoc = null;
      if (rightsInfo && Object.keys(rightsInfo).length > 0) {
        const doc = new RightsInfoGroup(rightsInfo);
        await doc.save();
        rightsInfoDoc = doc;
      }
  
      // Save project core sections
      const projectInfoDoc = new ProjectInfoSchema(projectData);
      const creditsInfoDoc = new CreditsInfoSchema(creditsInfo);
      const specificationsInfoDoc = new SpecificationsInfo(specificationsInfo);
  
      await projectInfoDoc.save();
      await creditsInfoDoc.save();
      await specificationsInfoDoc.save();
  
      // ✅ Process combined srtInfo (srtFiles and infoDocuments)
      let combinedSrtFiles = [];
      let combinedInfoDocs = [];
  
      // Ensure srtInfo is an object with srtFiles and infoDocuments arrays
      if (srtInfo) {
        combinedSrtFiles = srtInfo.srtFiles.filter(file => file !== null).map(file => ({
          fileName: file.fileName,
          filePath: file.filePath,
          fileType: file.fileType,
          fileSize: file.fileSize,
        }));
  
        combinedInfoDocs = srtInfo.infoDocuments.filter(file => file !== null).map(file => ({
          fileName: file.fileName,
          filePath: file.filePath,
          fileType: file.fileType,
          fileSize: file.fileSize,
        }));
      }
  
      // Create the SrtInfoFileSet document with combined arrays
      const combinedDoc = new SrtInfoFileSchema({
        srtFiles: combinedSrtFiles,  // Store all srtFiles here
        infoDocFiles: combinedInfoDocs,  // Store all infoDocFiles here
        userId: cleanUserId,
        projectName: projectInfo.projectName,
        orgName: projectInfo.orgName || "",
      });
  
      await combinedDoc.save();
  
      // Save final ProjectForm with references to SrtInfoFileSet
      const projectFormDoc = new ProjectForm({
        projectInfo: projectInfoDoc._id,
        creditsInfo: creditsInfoDoc._id,
        specificationsInfo: specificationsInfoDoc._id,
        screeningsInfo: screeningsInfoDocs,
        rightsInfo: rightsInfoDoc?._id,
        srtFiles: [combinedDoc._id],  // Store reference to SrtInfoFileSet document
        infoDocs: [],  // Optional: remove this if no longer needed
      });
  
      await projectFormDoc.save();
  
      return projectFormDoc;
    } catch (error) {
      console.error("❌ Error in service:", error);
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

  getProjectById: async (id) => {
    try {
      const projectId =
        typeof id === "string"
          ? mongoose.Types.ObjectId(id)
          : id instanceof mongoose.Types.ObjectId
          ? id
          : null;

      if (!projectId) {
        throw new Error("Invalid project ID format");
      }

      const projectForm = await ProjectForm.findOne({ projectInfo: projectId });

      if (!projectForm) return null;

      return await projectForm
        .populate([
          { path: "projectInfo" },
          { path: "submitterInfo" },
          { path: "creditsInfo" },
          { path: "specificationsInfo" },
          { path: "screeningsInfo" },
          { path: "rightsInfo" }, // ✅ Now a single document
        ])
        .execPopulate();
    } catch (error) {
      console.error("Error fetching project by ID:", error.message);
      throw new Error("Error fetching project by ID");
    }
  },

  // Update the project form with new data
  updateProjectForm: async (id, updateData) => {
    try {
      return await ProjectForm.findByIdAndUpdate(id, updateData, {
        new: true,
      }).populate([
        "projectInfo",
        "submitterInfo",
        "creditsInfo",
        "specificationsInfo",
        "screeningsInfo",
        "rightsInfo",
      ]);
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

      await ProjectInfoSchema.findByIdAndDelete(projectForm.projectInfo);
      await SubmitterInfoSchema.findByIdAndDelete(projectForm.submitterInfo);
      await CreditsInfoSchema.findByIdAndDelete(projectForm.creditsInfo);
      await SpecificationsInfo.findByIdAndDelete(projectForm.specificationsInfo);

      if (Array.isArray(projectForm.screeningsInfo) && projectForm.screeningsInfo.length > 0) {
        await ScreeningsInfo.deleteMany({ _id: { $in: projectForm.screeningsInfo } });
      }

      if (projectForm.rightsInfo) {
        await RightsInfoGroup.findByIdAndDelete(projectForm.rightsInfo);
      }

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
