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

    const normalizeFileName = (file) => {
      if (file && typeof file === "object" && file.fileName) return file.fileName;
      if (typeof file === "string") return file;
      return "";
    };

    // Normalize trailer URL if it's in object form
    if (
      projectInfo.s3SourceTrailerUrl &&
      typeof projectInfo.s3SourceTrailerUrl === "object" &&
      projectInfo.s3SourceTrailerUrl.fileUrl
    ) {
      projectInfo.s3SourceTrailerUrl = projectInfo.s3SourceTrailerUrl.fileUrl;
    }

    // Prepare main project info
    const projectData = {
      ...projectInfo,
      userId: cleanUserId,
      posterFileName: normalizeFileName(projectInfo.posterFileName),
      bannerFileName: normalizeFileName(projectInfo.bannerFileName),
      trailerFileName: normalizeFileName(projectInfo.trailerFileName),
      movieFileName: normalizeFileName(projectInfo.movieFileName),
    };

    // Embed dubbed files
    if (Array.isArray(dubbedFiles) && dubbedFiles.length > 0) {
      projectData.dubbedFileData = dubbedFiles.map((file) => ({
        language: file.language,
        dubbedTrailerFileName: file.dubbedTrailerFileName || '',
        dubbedTrailerUrl: file.dubbedTrailerUrl || '',
        dubbedSubtitleFileName: file.dubbedSubtitleFileName || '',
        dubbedSubtitleUrl: file.dubbedSubtitleUrl || '',
      }));

      console.log("🟢 Dubbed files processed:", projectData.dubbedFileData);
    } else {
      console.log("ℹ️ No dubbed files provided or empty array.");
    }

    // Convert genres to string
    if (Array.isArray(specificationsInfo.genres)) {
      specificationsInfo.genres = specificationsInfo.genres
        .map((g) => (typeof g === "string" ? g : g?.name))
        .filter(Boolean)
        .join(", ")
        .toLowerCase();

      console.log("🟢 Normalized genres:", specificationsInfo.genres);
    }

    // ======= FIXED rightsInfo handling - unwrap nested arrays =======
    let rightsInfoDoc = null;
    if (rightsInfo && typeof rightsInfo === "object") {
      let rightsArray = [];
      let territoriesArray = [];
      let licenseTermArray = [];
      let platformTypeArray = [];
      let usageRightsArray = [];
      let paymentTermsArray = [];
      let listPriceValue = '';

      if (Array.isArray(rightsInfo.rights) && rightsInfo.rights.length > 0) {
        // Assuming the first element contains the actual rights info object
        const firstRightsInfo = rightsInfo.rights[0];

        rightsArray = Array.isArray(firstRightsInfo.rights) ? firstRightsInfo.rights : [];
        territoriesArray = Array.isArray(firstRightsInfo.territories) ? firstRightsInfo.territories : [];
        licenseTermArray = Array.isArray(firstRightsInfo.licenseTerm) ? firstRightsInfo.licenseTerm : [];
        platformTypeArray = Array.isArray(firstRightsInfo.platformType) ? firstRightsInfo.platformType : [];
        usageRightsArray = Array.isArray(firstRightsInfo.usageRights) ? firstRightsInfo.usageRights : [];
        paymentTermsArray = Array.isArray(firstRightsInfo.paymentTerms) ? firstRightsInfo.paymentTerms : [];
        listPriceValue = firstRightsInfo.listPrice || '';
      }

      rightsInfoDoc = new RightsInfoGroup({
        userId: cleanUserId,
        projectName: projectInfo.projectName,
        rights: rightsArray,
        territories: territoriesArray,
        licenseTerm: licenseTermArray,
        platformType: platformTypeArray,
        usageRights: usageRightsArray,
        paymentTerms: paymentTermsArray,
        listPrice: listPriceValue,
      });

      await rightsInfoDoc.save();
      console.log("🟢 RightsInfoGroup saved:", rightsInfoDoc);
    } else {
      console.log("ℹ️ No rightsInfo object provided or invalid.");
    }
    // ===========================================================================

    // Save main schemas
    const projectInfoDoc = new ProjectInfoSchema(projectData);
    await projectInfoDoc.save();
    console.log("🟢 ProjectInfoSchema saved:", projectInfoDoc);

    const creditsInfoDoc = new CreditsInfoSchema(creditsInfo);
    await creditsInfoDoc.save();
    console.log("🟢 CreditsInfoSchema saved:", creditsInfoDoc);

    const specificationsInfoDoc = new SpecificationsInfo(specificationsInfo);
    await specificationsInfoDoc.save();
    console.log("🟢 SpecificationsInfo saved:", specificationsInfoDoc);

    // Parse and normalize SRT info
    const combinedSrtFiles = Array.isArray(srtInfo?.srtFiles) ? srtInfo.srtFiles : [];
    const combinedInfoDocs = Array.isArray(srtInfo?.infoDocuments) ? srtInfo.infoDocuments : [];

    const srtFilesMapped = combinedSrtFiles.map((file) => ({
      fileName: file.fileName || '',
      fileUrl: file.filePath || file.fileUrl || '',
    }));

    const infoDocsMapped = combinedInfoDocs.map((file) => ({
      fileName: file.fileName || '',
      fileUrl: file.filePath || file.fileUrl || '',
    }));

    const combinedDoc = new SrtInfoFileSchema({
      srtFiles: srtFilesMapped,
      infoDocuments: infoDocsMapped,
      userId: cleanUserId,
      projectName: projectInfo.projectName,
      orgName: projectInfo.orgName || "",
    });

    await combinedDoc.save();
    console.log("🟢 SrtInfoFileSchema saved:", combinedDoc);

    // Create final project form
    const projectFormDoc = new ProjectForm({
      projectInfo: projectInfoDoc._id,
      creditsInfo: creditsInfoDoc._id,
      specificationsInfo: specificationsInfoDoc._id,
      rightsInfo: rightsInfoDoc ? [rightsInfoDoc._id] : [],
      srtFiles: [combinedDoc._id],
    });

    await projectFormDoc.save();
    console.log("🟢 ProjectForm saved:", projectFormDoc);

    // Link back references
    projectInfoDoc.creditsInfoId = creditsInfoDoc._id;
    projectInfoDoc.specificationsInfoId = specificationsInfoDoc._id;
    projectInfoDoc.rightsInfoId = rightsInfoDoc ? rightsInfoDoc._id : null;
    projectInfoDoc.srtFilesId = combinedDoc._id;
    projectInfoDoc.projectFormId = projectFormDoc._id;

    await projectInfoDoc.save();
    console.log("🟢 ProjectInfoDoc updated with references:", projectInfoDoc);

    return projectFormDoc;
  } catch (error) {
    console.error("❌ Error in service:", error);
    throw new Error("Error saving project form: " + error.message);
  }
}


,


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
