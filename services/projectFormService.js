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
import DubbedFiles from "../models/projectFormModels/FormModels/DubbedFilesSchema.js";

const projectFormService = {
 
createProjectForm: async (
  projectInfo,
  creditsInfo,
  specificationsInfo,
  screeningsInfo,
  rightsInfo,
  srtInfo,
  dubbedFiles,
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

    // ✅ Normalize file name from object or string
    const normalizeFileName = (file) => {
      if (file && typeof file === 'object' && file.fileName) {
        return file.fileName;
      }
      if (typeof file === 'string') {
        return file;
      }
      return '';
    };

    // ✅ Normalize s3SourceTrailerUrl if it’s an object
    if (
      projectInfo.s3SourceTrailerUrl &&
      typeof projectInfo.s3SourceTrailerUrl === 'object' &&
      projectInfo.s3SourceTrailerUrl.fileUrl
    ) {
      projectInfo.s3SourceTrailerUrl = projectInfo.s3SourceTrailerUrl.fileUrl;
    }

    const projectData = {
      ...projectInfo,
      userId: cleanUserId,
      posterFileName: normalizeFileName(projectInfo.posterFileName),
      bannerFileName: normalizeFileName(projectInfo.bannerFileName),
      trailerFileName: normalizeFileName(projectInfo.trailerFileName),
      movieFileName: normalizeFileName(projectInfo.movieFileName),
    };

    // ✅ Convert genres from array of objects to comma-separated string
    if (Array.isArray(specificationsInfo.genres)) {
      specificationsInfo.genres = specificationsInfo.genres
        .map((g) => typeof g === 'string' ? g : g?.name)
        .filter(Boolean)
        .join(', ')
        .toLowerCase();
    }

    // 🟩 Save screenings
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

    // 🟩 Save rightsInfo (multiple entries)
    let rightsInfoDocs = [];
    if (rightsInfo && typeof rightsInfo === "object") {
      for (const key in rightsInfo) {
        const doc = new RightsInfoGroup({
          ...rightsInfo[key],
          userId: cleanUserId,
          projectName: projectInfo.projectName,
        });
        await doc.save();
        rightsInfoDocs.push(doc._id);
      }
    }

    // 🟩 Save core sections
    const projectInfoDoc = new ProjectInfoSchema(projectData);
    const creditsInfoDoc = new CreditsInfoSchema(creditsInfo);
    const specificationsInfoDoc = new SpecificationsInfo(specificationsInfo);

    await projectInfoDoc.save();
    await creditsInfoDoc.save();
    await specificationsInfoDoc.save();

    // 🟩 Parse SRT info
    let combinedSrtFiles = [];
    let combinedInfoDocs = [];

    if (Array.isArray(srtInfo)) {
      srtInfo.forEach((item) => {
        if (item.srtFile) {
          combinedSrtFiles.push(item.srtFile);
        }
        if (item.infoDocFile) {
          combinedInfoDocs.push(item.infoDocFile);
        }
      });
    }

    const combinedDoc = new SrtInfoFileSchema({
      srtFiles: combinedSrtFiles,
      infoDocFiles: combinedInfoDocs,
      userId: cleanUserId,
      projectName: projectInfo.projectName,
      orgName: projectInfo.orgName || "",
    });

    await combinedDoc.save();

    // ✅ Dubbed Files: Save as one grouped document
    let dubbedFileDoc = null;
    if (Array.isArray(dubbedFiles) && dubbedFiles.length > 0) {
      dubbedFileDoc = new DubbedFiles({
        projectId: projectInfoDoc._id,
        dubbedFiles: dubbedFiles,
      });
      await dubbedFileDoc.save();
    }

    // 🟩 Create and save final ProjectForm
    const projectFormDoc = new ProjectForm({
      projectInfo: projectInfoDoc._id,
      creditsInfo: creditsInfoDoc._id,
      specificationsInfo: specificationsInfoDoc._id,
      screeningsInfo: screeningsInfoDocs,
      rightsInfo: rightsInfoDocs,
      srtFiles: [combinedDoc._id],
      dubbedFiles: dubbedFileDoc ? [dubbedFileDoc._id] : [],
    });

    await projectFormDoc.save();

    // 🔗 Attach foreign keys back to projectInfo doc
    projectInfoDoc.creditsInfoId = creditsInfoDoc._id;
    projectInfoDoc.specificationsInfoId = specificationsInfoDoc._id;
    projectInfoDoc.screeningsInfoIds = screeningsInfoDocs;
    projectInfoDoc.rightsInfoId = rightsInfoDocs[0] || null;
    projectInfoDoc.srtInfoFileId = combinedDoc._id;
    projectInfoDoc.projectFormId = projectFormDoc._id;

    await projectInfoDoc.save();

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
          ? new mongoose.Types.ObjectId(id)
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
