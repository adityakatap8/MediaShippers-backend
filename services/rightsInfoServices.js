// Import the RightsInfoSchema model using ES module import
import RightsInfoSchema from '../models/projectFormModels/FormModels/RightsInfoSchema.js';

// Service function to get all rights info
export const getAllRightsInfo = async () => {
  try {
    const rightsInfo = await RightsInfoSchema.find();
    return rightsInfo;
  } catch (error) {
    throw new Error('Error fetching rights info');
  }
};

// Service function to create a new rights info
export const createRightsInfo = async (title) => {
  try {
    const newRightsInfo = new RightsInfoSchema({ title });
    await newRightsInfo.save();
    return newRightsInfo;
  } catch (error) {
    throw new Error('Error creating new rights info');
  }
};


// Service function to get rights info by userId
export const getRightsInfoByUserId = async (userId) => {
    try {
      // Assuming RightsInfoSchema has a reference to userId (this can vary depending on your schema)
      const rightsInfo = await RightsInfoSchema.find({ userId });
      return rightsInfo;
    } catch (error) {
      throw new Error('Error fetching rights info for userId: ' + error.message);
    }
  };
  
  // Service function to update rights info by rightsInfoId
  export const updateRightsInfo = async (rightsInfoId, title) => {
    try {
      const updatedRightsInfo = await RightsInfoSchema.findByIdAndUpdate(
        rightsInfoId,
        { title },
        { new: true } // Return the updated document
      );
      return updatedRightsInfo;
    } catch (error) {
      throw new Error('Error updating rights info: ' + error.message);
    }
  };