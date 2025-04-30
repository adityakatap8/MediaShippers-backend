// controller/rightsInfoController.js

import * as RightsInfoService from '../services/rightsInfoServices.js';

// Controller to get all RightsInfo
export const getAllRightsInfo = async (req, res) => {
  try {
    const rightsInfo = await RightsInfoService.getAllRightsInfo();
    res.status(200).json({ success: true, data: rightsInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controller to create a new RightsInfo entry
export const createRightsInfo = async (req, res) => {
  try {
    const rightsInfoData = req.body;

    const newRightsInfo = await RightsInfoService.createRightsInfo(rightsInfoData);
    res.status(201).json({ success: true, data: newRightsInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controller to delete a RightsInfo entry by ID
export const deleteRightsInfo = async (req, res) => {
  try {
    const { rightsInfoId } = req.params;
    const deletedRightsInfo = await RightsInfoService.deleteRightsInfo(rightsInfoId);
    if (deletedRightsInfo) {
      res.status(200).json({ success: true, message: 'Rights info deleted successfully.' });
    } else {
      res.status(404).json({ success: false, message: 'Rights info not found.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Controller to get RightsInfo by userId
export const getRightsInfoByUserId = async (req, res) => {
    try {
      const { userId } = req.params;
      const rightsInfo = await RightsInfoService.getRightsInfoByUserId(userId);
      if (rightsInfo) {
        res.status(200).json({ success: true, data: rightsInfo });
      } else {
        res.status(404).json({ success: false, message: 'No rights information found for this user' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  // Controller to update RightsInfo by rightsInfoId
  export const updateRightsInfo = async (req, res) => {
    try {
      const { rightsInfoId } = req.params;
      const { title } = req.body;
  
      // Ensure we have title data to update
      if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required' });
      }
  
      const updatedRightsInfo = await RightsInfoService.updateRightsInfo(rightsInfoId, title);
  
      if (updatedRightsInfo) {
        res.status(200).json({ success: true, data: updatedRightsInfo });
      } else {
        res.status(404).json({ success: false, message: 'Rights info not found' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };