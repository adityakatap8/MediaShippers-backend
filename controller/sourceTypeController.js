import SourceTypeService from "../services/sourceTypeService.js";
import SourceType from "../models/SourceType.js";

const sourceTypeController = {
  getSourceTypes: async (req, res) => {
    try {
      const sourceTypes = await SourceTypeService.getSourceTypes();
      res.json(sourceTypes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getSourceTypeById: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Log the incoming request for debugging
      console.log(`Received request for Source Type with ID: ${id}`);
      
      const sourceType = await SourceTypeService.getSourceTypeById(id);
      
      if (!sourceType) {
        // Log the case when the source type is not found
        console.log(`Source Type with ID ${id} not found.`);
        return res.status(404).json({ error: 'Source Type not found' });
      }
      
      // Log the found source type
      console.log(`Source Type found:`, sourceType);
      
      res.json(sourceType); // Respond with the source type if found
  
    } catch (error) {
      // Log the error for debugging
      console.error('Error fetching Source Type:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  

  // createSourceType: async (req, res) => {
  //   try {
  //     const fileName = req.file.originalname;
      
  //     // Store the filename in memory (you might want to save it to a database later)
  //     console.log(`Uploaded file name: ${fileName}`);
      
  //     res.status(200).json({ 
  //       message: 'File uploaded successfully',
  //       fileName: fileName
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ error: 'Error uploading file' });
  //   }
  // },
  createSourceType: async (req, res) => {
    try {
      console.log('Received request body:', req.body); // Add this line for debugging
      
      const { sourceTypeData, metadata } = req.body;
      
      if (!sourceTypeData) {
          return res.status(400).json({ error: 'sourceTypeData is required' });
      }

      // Validate metadata
      if (metadata && typeof metadata !== 'object') {
          return res.status(400).json({ error: 'Invalid metadata format' });
      }

      // Create the source type without metadata if it's not provided
      const newSourceType = await SourceTypeService.createSourceType({
          ...sourceTypeData,
          metadata: metadata || null // Set metadata to null if not provided
      });

      res.status(201).json({ message: 'Source type saved successfully', id: newSourceType.id });
  } catch (error) {
      console.error('Error in createSourceType:', error);
      res.status(500).json({ error: 'Failed to save source type', details: error.message });
  }
  },

  updateSourceType: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedSourceType = await SourceTypeService.updateSourceType(id, req.body);
      res.json(updatedSourceType);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  deleteSourceType: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await SourceTypeService.deleteSourceType(id);
      if (!result.success) {
        return res.status(404).json({ error: 'Source Type not found' });
      }
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export default sourceTypeController;
