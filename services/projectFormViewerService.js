import mongoose from "mongoose";
import { ObjectId } from "mongodb";

class ProjectFormViewerService {
  static async getProjectFormData(id) {
    try {
      console.log("Input ID from controller:", id);

      // Ensure the ID is present and valid
      if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
      }

      // Log the provided ID for debugging
      console.log("Using provided ID:", id);

      const result = await mongoose.model("ProjectForm").aggregate([
        {
          $match: { projectInfo: new ObjectId(id) }, // Match with the converted ObjectId
        },
        {
          $lookup: {
            from: "projectinfos",
            localField: "projectInfo",
            foreignField: "_id",
            as: "projectInfoData",
          },
        },
        {
          $lookup: {
            from: "submitterinfos",
            localField: "submitterInfo",
            foreignField: "_id",
            as: "submitterInfoData",
          },
        },
        {
          $lookup: {
            from: "creditsinfos",
            localField: "creditsInfo",
            foreignField: "_id",
            as: "creditsInfoData",
          },
        },
        {
          $lookup: {
            from: "specificationsinfos",
            localField: "specificationsInfo",
            foreignField: "_id",
            as: "specificationsInfoData",
          },
        },
        {
          $lookup: {
            from: "screeningsinfos",
            let: { screeningIds: "$screeningsInfo" }, // Adjusted field reference
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$screeningIds"] } } }, // Match array of ObjectIds
            ],
            as: "screeningsInfoData",
          },
        },
        {
          $project: {
            _id: 1,
            projectInfoData: { $arrayElemAt: ["$projectInfoData", 0] }, // Extract the first element of arrays
            submitterInfoData: { $arrayElemAt: ["$submitterInfoData", 0] },
            creditsInfoData: { $arrayElemAt: ["$creditsInfoData", 0] },
            specificationsInfoData: { $arrayElemAt: ["$specificationsInfoData", 0] },
            screeningsInfoData: 1, // Keep the array of screenings data
          },
        },
      ]);

      // Check if result exists and log the output
      if (!result || result.length === 0) {
        console.error("Project data not found for ID:", id);
        throw new Error("Project not found");
      }

      console.log("Final Aggregated Result:", JSON.stringify(result[0], null, 2));

      return result[0];
    } catch (error) {
      console.error("Error fetching project data:", error.message);
      throw error;
    }
  }
}

export default ProjectFormViewerService;
