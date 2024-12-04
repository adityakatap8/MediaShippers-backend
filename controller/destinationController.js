// import destinationService from "../services/destinationTypeService.js";

// const destinationTypeController = {
  
//   // Get all destination types
//   getAllDestinations: async (req, res) => {
//     try {
//       const destinations = await destinationService.getAllDestinations();
//       res.status(200).json(destinations);  // Return the list of all destinations
//     } catch (error) {
//       console.error('Error fetching destinations:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   // Get a specific destination by ID
//   getDestinationById: async (req, res) => {
//     const { id } = req.params;
//     try {
//       console.log(`Received request for destination with ID: ${id}`);
//       const destination = await destinationService.getDestinationById(id);
      
//       if (!destination) {
//         console.log(`Destination with ID ${id} not found.`);
//         return res.status(404).json({ error: 'Destination not found' });
//       }

//       console.log(`Destination found:`, destination);
//       res.status(200).json(destination);
//     } catch (error) {
//       console.error('Error fetching destination:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   // Create a new destination type
//   createDestination: async (req, res) => {
//     try {
//       console.log('Received request body:', req.body);

//       const { destinationData, metadata } = req.body;
      
//       if (!destinationData) {
//         return res.status(400).json({ error: 'destinationData is required' });
//       }

//       // Validate metadata if present
//       if (metadata && typeof metadata !== 'object') {
//         return res.status(400).json({ error: 'Invalid metadata format' });
//       }

//       const newDestination = await destinationService.createDestination({
//         ...destinationData,
//         metadata: metadata || null, // Use null if metadata is not provided
//       });

//       res.status(201).json({
//         message: 'Destination type saved successfully',
//         id: newDestination.id
//       });

//     } catch (error) {
//       console.error('Error in createDestination:', error);
//       res.status(500).json({ error: 'Failed to save destination', details: error.message });
//     }
//   },

//   // Update an existing destination type
//   updateDestination: async (req, res) => {
//     const { id } = req.params;
//     try {
//       const updatedDestination = await destinationService.updateDestination(id, req.body);
//       if (!updatedDestination) {
//         return res.status(404).json({ error: 'Destination not found' });
//       }
//       res.status(200).json(updatedDestination);
//     } catch (error) {
//       console.error('Error updating destination:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   },

//   // Delete a destination type by ID
//   deleteDestination: async (req, res) => {
//     const { id } = req.params;
//     try {
//       const result = await destinationService.deleteDestination(id);
//       if (!result.success) {
//         return res.status(404).json({ error: 'Destination not found' });
//       }
//       res.status(200).json({ message: 'Destination deleted successfully' });
//     } catch (error) {
//       console.error('Error deleting destination:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// };

// export default destinationTypeController;


import destinationService from "../services/destinationTypeService.js";

const destinationTypeController = {
  
  // Get all destination types
  getAllDestinations: async (req, res) => {
    try {
      const destinations = await destinationService.getAllDestinations();
      res.status(200).json(destinations);  // Return the list of all destinations
    } catch (error) {
      console.error('Error fetching destinations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get a specific destination by ID
  getDestinationById: async (req, res) => {
    const { id } = req.params;
    try {
      console.log(`Received request for destination with ID: ${id}`);
      const destination = await destinationService.getDestinationById(id);
      
      if (!destination) {
        console.log(`Destination with ID ${id} not found.`);
        return res.status(404).json({ error: 'Destination not found' });
      }

      console.log(`Destination found:`, destination);
      res.status(200).json(destination);
    } catch (error) {
      console.error('Error fetching destination:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create a new destination type
//   createDestination: async (req, res) => {
//     try {
//       console.log('Received request body:', req.body);

//       const { destinationData, metadata } = req.body;
      
//       if (!destinationData) {
//         return res.status(400).json({ error: 'destinationData is required' });
//       }

//       // Validate metadata if present
//       if (metadata && typeof metadata !== 'object') {
//         return res.status(400).json({ error: 'Invalid metadata format' });
//       }

//       const newDestination = await destinationService.createDestination({
//         ...destinationData,
//         metadata: metadata || null, // Use null if metadata is not provided
//       });

//       res.status(201).json({
//         message: 'Destination type saved successfully',
//         id: newDestination.id
//       });

//     } catch (error) {
//       console.error('Error in createDestination:', error);
//       res.status(500).json({ error: 'Failed to save destination', details: error.message });
//     }
//   },


createDestination: async (req, res) => {
    try {
      console.log('Received request body:', req.body);

      const { destinationData, metadata } = req.body;
      
      if (!destinationData) {
        return res.status(400).json({ error: 'destinationData is required' });
      }

      // Validate metadata if present
      if (metadata && typeof metadata !== 'object') {
        return res.status(400).json({ error: 'Invalid metadata format' });
      }

      // Assuming the provider is one of the configured services, i.e., AWS, GCP, or Azure
      // You might want to ensure that at least one config (awsS3Config, gcpConfig, or azureConfig) is provided.
      const { awsS3Config, gcpConfig, azureConfig, email } = destinationData;

      if (!awsS3Config && !gcpConfig && !azureConfig) {
        return res.status(400).json({ error: 'At least one configuration is required' });
      }

      // Use the data from destinationData to create the destination
      const newDestination = await destinationService.createDestination({
        awsS3Config,
        gcpConfig,
        azureConfig,
        email,
        metadata: metadata || null,  // Add metadata if it's present
      });

      res.status(201).json({
        message: 'Destination type saved successfully',
        id: newDestination.id,
      });

    } catch (error) {
      console.error('Error in createDestination:', error);
      res.status(500).json({ error: 'Failed to save destination', details: error.message });
    }
  },



  // Update an existing destination type
  updateDestination: async (req, res) => {
    const { id } = req.params;
    try {
      const updatedDestination = await destinationService.updateDestination(id, req.body);
      if (!updatedDestination) {
        return res.status(404).json({ error: 'Destination not found' });
      }
      res.status(200).json(updatedDestination);
    } catch (error) {
      console.error('Error updating destination:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete a destination type by ID
  deleteDestination: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await destinationService.deleteDestination(id);
      if (!result.success) {
        return res.status(404).json({ error: 'Destination not found' });
      }
      res.status(200).json({ message: 'Destination deleted successfully' });
    } catch (error) {
      console.error('Error deleting destination:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }



};



export default destinationTypeController;
