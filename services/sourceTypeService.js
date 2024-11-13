// services/sourceTypeService.js

import SourceType from "../models/SourceType.js";

class SourceTypeService {
  static async getSourceTypes() {
    try {
      const sourceTypes = await SourceType.find().sort({ createdAt: -1 });
      return sourceTypes;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async getSourceTypeById(id) {
    try {
      const sourceType = await SourceType.findById(id);
      if (!sourceType) {
        throw new Error('Source Type not found');
      }
      return sourceType;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async createSourceType(data) {
    try {
      const newSourceType = new SourceType(data);
      await newSourceType.save();
      return newSourceType;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateSourceType(id, data) {
    try {
      const updatedSourceType = await SourceType.findByIdAndUpdate(
        id,
        data,
        { new: true }
      );
      if (!updatedSourceType) {
        throw new Error('Source Type not found');
      }
      return updatedSourceType;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deleteSourceType(id) {
    try {
      const deletedSourceType = await SourceType.findByIdAndDelete(id);
      if (!deletedSourceType) {
        throw new Error('Source Type not found');
      }
      return { success: true, message: 'Source Type deleted successfully' };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default SourceTypeService;
