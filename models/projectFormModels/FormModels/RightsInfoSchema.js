import mongoose from 'mongoose';

// Define the schema for a group of rights associated with a project
const RightsInfoGroupSchema = new mongoose.Schema(
  {
    projectName: { 
      type: String, 
      required: true 
    }, // The project name associated with the group of rights
    userId: { 
      type: String,  // UUID stored as a string
      required: true 
    },  // The user ID associated with the rights
    rightsInfo: [  // Array of selected rights
      {
        name: { type: String, required: true },  // The name of the right (e.g., "Television Broadcast Rights")
        id: { type: Number, required: true },    // The id of the right (used to identify the right type)
      }
    ],
  },
  {
    timestamps: true,  // Add timestamps (createdAt and updatedAt)
  }
);

// Create and export the model for the rightsInfo group
export default mongoose.model('RightsInfoGroup', RightsInfoGroupSchema);
