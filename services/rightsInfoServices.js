import RightsInfoGroup from '../models/projectFormModels/FormModels/RightsInfoSchema.js'; // Correct model

export const createRightsInfo = async (data) => {
  const rightsInfoDoc = new RightsInfoGroup(data); // ✅ correct model used
  return await rightsInfoDoc.save();
};

export const getAllRightsInfo = async () => {
  return await RightsInfoGroup.find();
};

export const getRightsInfoByUserId = async (userId) => {
  return await RightsInfoGroup.find({ userId });
};

export const deleteRightsInfo = async (rightsInfoId) => {
  return await RightsInfoGroup.findByIdAndDelete(rightsInfoId);
};

export const updateRightsInfo = async (rightsInfoId, title) => {
  return await RightsInfoGroup.findByIdAndUpdate(
    rightsInfoId,
    { $set: { projectName: title } },
    { new: true }
  );
};
