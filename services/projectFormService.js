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

    if (!cleanUserId) throw new Error("userId is missing or invalid.");

    const normalizeFileName = (file) => {
      if (file && typeof file === "object" && file.fileName) return file.fileName;
      if (typeof file === "string") return file;
      return "";
    };

    if (
      projectInfo.s3SourceTrailerUrl &&
      typeof projectInfo.s3SourceTrailerUrl === "object" &&
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

    if (Array.isArray(specificationsInfo.genres)) {
      specificationsInfo.genres = specificationsInfo.genres
        .map((g) => (typeof g === "string" ? g : g?.name))
        .filter(Boolean)
        .join(", ")
        .toLowerCase();
      console.log("🟢 Normalized genres:", specificationsInfo.genres);
    }

    // ✅ FIX: Save multiple rightsGroups in RightsInfoGroup
    let rightsInfoDoc = null;
    if (
      rightsInfo &&
      typeof rightsInfo === "object" &&
      Array.isArray(rightsInfo.rights)
    ) {
      const rightsGroupsArray = rightsInfo.rights.map((group) => ({
        rights: group.rights || [],
        territories: group.territories || {
          includedRegions: [],
          excludeCountries: [],
        },
        licenseTerm: group.licenseTerm || [],
        platformType: group.platformType || [],
        usageRights: group.usageRights || [],
        paymentTerms: group.paymentTerms || [],
        listPrice: group.listPrice || "",
      }));

      rightsInfoDoc = new RightsInfoGroup({
        userId: cleanUserId,
        projectName: projectInfo.projectName,
        rightsGroups: rightsGroupsArray,
      });

      await rightsInfoDoc.save();
      console.log("🟢 RightsInfoGroup saved:", rightsInfoDoc);
    } else {
      console.log("ℹ️ No rightsInfo object provided or invalid.");
    }

    // Save other parts
    const projectInfoDoc = new ProjectInfoSchema(projectData);
    await projectInfoDoc.save();
    console.log("🟢 ProjectInfoSchema saved:", projectInfoDoc);

    const creditsInfoDoc = new CreditsInfoSchema(creditsInfo);
    await creditsInfoDoc.save();
    console.log("🟢 CreditsInfoSchema saved:", creditsInfoDoc);

    const specificationsInfoDoc = new SpecificationsInfo(specificationsInfo);
    await specificationsInfoDoc.save();
    console.log("🟢 SpecificationsInfo saved:", specificationsInfoDoc);

    const srtFilesMapped = Array.isArray(srtInfo?.srtFiles)
      ? srtInfo.srtFiles.map((file) => ({
          fileName: file.fileName || "",
          fileUrl: file.filePath || file.fileUrl || "",
        }))
      : [];

    const infoDocsMapped = Array.isArray(srtInfo?.infoDocuments)
      ? srtInfo.infoDocuments.map((file) => ({
          fileName: file.fileName || "",
          fileUrl: file.filePath || file.fileUrl || "",
        }))
      : [];

    const combinedDoc = new SrtInfoFileSchema({
      srtFiles: srtFilesMapped,
      infoDocuments: infoDocsMapped,
      userId: cleanUserId,
      projectName: projectInfo.projectName,
      orgName: projectInfo.orgName || "",
    });

    await combinedDoc.save();
    console.log("🟢 SrtInfoFileSchema saved:", combinedDoc);

    const projectFormDoc = new ProjectForm({
      projectInfo: projectInfoDoc._id,
      creditsInfo: creditsInfoDoc._id,
      specificationsInfo: specificationsInfoDoc._id,
      rightsInfo: rightsInfoDoc ? [rightsInfoDoc._id] : [],
      srtFiles: [combinedDoc._id],
    });

    await projectFormDoc.save();
    console.log("🟢 ProjectForm saved:", projectFormDoc);

    // Link references
    projectInfoDoc.creditsInfoId = creditsInfoDoc._id;
    projectInfoDoc.specificationsInfoId = specificationsInfoDoc._id;
    projectInfoDoc.rightsInfoId = rightsInfoDoc?._id || null;
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

 findProjectFormByProjectInfo: async (projectInfoId) => {
  try {
    const id = new mongoose.Types.ObjectId(projectInfoId);
    return await ProjectForm.findOne({ projectInfo: id });
  } catch (error) {
    console.error("Error finding project form by projectInfo ID:", error.message);
    throw new Error("Error finding project form by projectInfo ID");
  }
},

bulkCreateProjectForms: async (projects, userId) => {
  try {
    const createdProjects = [];
    const skippedProjects = [];

    // --- Inner utility to transform flat to nested ---
    function transformFlatToNestedProject(flatProject) {
      const {
        projectTitle,
        projectName,
        briefSynopsis,
        projectType,
        posterFileName,
        bannerFileName,
        trailerFileName,
        movieFileName,
        projectPosterS3Url,
        projectBannerS3Url,
        projectTrailerS3Url,
        projectMovieS3Url,
        isPublic,
        dubbedFileData,

        producers,
        directors,
        writers,
        actors,

        genres,
        language,
        availableLanguages,
      } = flatProject;

      return {
        projectInfo: {
          projectTitle,
          projectName: projectName?.trim() || projectTitle,
          briefSynopsis,
          projectType,
          posterFileName,
          bannerFileName,
          trailerFileName,
          movieFileName,
          projectPosterS3Url,
          projectBannerS3Url,
          projectTrailerS3Url,
          projectMovieS3Url,
          isPublic,
          dubbedFileData: Array.isArray(dubbedFileData)
            ? dubbedFileData.map((item) => ({
                language: item.language,
                dubbedTrailerFileName: item.dubbedTrailerFileName,
                dubbedTrailerUrl: item.dubbedTrailerUrl,
                dubbedSubtitleFileName: item.dubbedSubtitleFileName,
                dubbedSubtitleUrl: item.dubbedSubtitleUrl,
              }))
            : [],
        },
        creditsInfo: {
          producers,
          directors,
          writers,
          actors,
        },
        specificationsInfo: {
          genres,
          language,
          availableLanguages,
        },
        rightsInfo: {},
        srtInfo: {},
      };
    }

    // --- Main loop ---
    for (let i = 0; i < projects.length; i++) {
      const rawFlatProject = projects[i];
      const raw = transformFlatToNestedProject(rawFlatProject || {});

      const {
        projectInfo = {},
        creditsInfo = {},
        specificationsInfo = {},
        rightsInfo = {},
        srtInfo = {},
      } = raw;

      let {
        projectTitle,
        projectName: rawProjectName,
        briefSynopsis,
        projectType,
        posterFileName,
        bannerFileName,
        trailerFileName,
        movieFileName,
        projectPosterS3Url,
        projectBannerS3Url,
        projectTrailerS3Url,
        projectMovieS3Url,
        isPublic,
        dubbedFileData = [],
      } = projectInfo;

      if (!projectTitle) {
        skippedProjects.push({ index: i, reason: "Missing required field: projectTitle" });
        continue;
      }

      const projectName = rawProjectName?.trim() || projectTitle;

      // ✅ Coerce isPublic into correct string values
      if (typeof isPublic === 'boolean') {
        isPublic = isPublic ? 'public' : 'private';
      } else if (typeof isPublic !== 'string' || !['public', 'private'].includes(isPublic)) {
        isPublic = 'private';
      }

      // ✅ Genres as comma string if array
      const transformedSpecificationsInfo = {
        ...specificationsInfo,
        genres: Array.isArray(specificationsInfo.genres)
          ? specificationsInfo.genres.join(", ")
          : specificationsInfo.genres || "",
      };

      // ✅ Filter invalid dubbed file entries
      const cleanDubbedFiles = Array.isArray(dubbedFileData)
        ? dubbedFileData
            .filter(
              (file) =>
                typeof file.language === "string" &&
                file.language.trim() !== "" &&
                (file.dubbedTrailerFileName || file.dubbedSubtitleFileName)
            )
            .map((file) => ({
              language: file.language.trim(),
              dubbedTrailerFileName: file.dubbedTrailerFileName || "",
              dubbedTrailerUrl: file.dubbedTrailerUrl || "",
              dubbedSubtitleFileName: file.dubbedSubtitleFileName || "",
              dubbedSubtitleUrl: file.dubbedSubtitleUrl || "",
            }))
        : [];

      // ✅ Create subdocs
      const createdCreditsInfo = await CreditsInfoSchema.create(creditsInfo);
      const createdSpecificationsInfo = await SpecificationsInfo.create(transformedSpecificationsInfo);
      const createdRightsInfo = await RightsInfoGroup.create(rightsInfo);
      const createdSrtInfo = await SrtInfoFileSchema.create(srtInfo);

      // ✅ Create ProjectInfo
      const createdProjectInfo = await ProjectInfoSchema.create({
        projectTitle,
        projectName,
        briefSynopsis,
        projectType,
        posterFileName,
        bannerFileName,
        trailerFileName,
        movieFileName,
        projectPosterS3Url,
        projectBannerS3Url,
        projectTrailerS3Url,
        projectMovieS3Url,
        isPublic,
        userId,
        dubbedFileData: cleanDubbedFiles,
        creditsInfoId: createdCreditsInfo._id,
        specificationsInfoId: createdSpecificationsInfo._id,
        rightsInfoId: createdRightsInfo._id,
        srtFilesId: createdSrtInfo._id,
      });

      createdProjects.push(createdProjectInfo);
    }

    // --- Summary message
    let message;
    if (createdProjects.length === 0 && skippedProjects.length > 0) {
      message = "❌ All projects were skipped due to missing required fields.";
    } else if (createdProjects.length > 0 && skippedProjects.length > 0) {
      message = "⚠️ Some projects created, some skipped due to missing fields.";
    } else {
      message = "✅ All projects created successfully.";
    }

    return {
      message,
      count: createdProjects.length,
      projects: createdProjects,
      skipped: skippedProjects,
    };
  } catch (error) {
    console.error("❌ Error in bulkCreateProjectForms:", error);
    throw new Error("Bulk project creation failed. Please check server logs.");
  }
}








};




export default projectFormService;
