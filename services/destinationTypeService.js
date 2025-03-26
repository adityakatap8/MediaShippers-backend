import Destination from "../models/DestinationType.js";

// Create a new destination entry
// const createDestination = async (data) => {
//   try {
//     const destination = new Destination(data);
//     await destination.save();
//     return destination;
//   } catch (error) {
//     throw new Error('Error creating destination: ' + error.message);
//   }
// };

const createDestination = async (data) => {
    try {
      // Ensure the 'data' object is passed correctly and matches the schema
      const destination = new Destination(data);  // Create a new Destination document
      await destination.save();  // Save it to the database
      return destination;  // Return the saved destination object
    } catch (error) {
      throw new Error('Error creating destination: ' + error.message);  // Error handling
    }
  };
  

// Retrieve all destinations
const getAllDestinations = async () => {
  try {
    const destinations = await Destination.find();
    return destinations;
  } catch (error) {
    throw new Error('Error retrieving destinations: ' + error.message);
  }
};

// Retrieve destination by ID
const getDestinationById = async (id) => {
  try {
    const destination = await Destination.findById(id);
    if (!destination) throw new Error('Destination not found');
    return destination;
  } catch (error) {
    throw new Error('Error retrieving destination: ' + error.message);
  }
};

// Delete destination entry by ID
const deleteDestination = async (id) => {
  try {
    const destination = await Destination.findByIdAndDelete(id);
    if (!destination) throw new Error('Destination not found');
    return destination;
  } catch (error) {
    throw new Error('Error deleting destination: ' + error.message);
  }
};

export default {
  createDestination,
  getAllDestinations,
  getDestinationById,
  deleteDestination,
};
