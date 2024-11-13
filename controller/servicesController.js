import { CodecSettings, QualityCheck, FileTransfer, ServicesMain } from '../models/ServicesMainSchema.js'; // Correct path for your schema

// Create a new service
export const createService = async (req, res) => {
    try {
        console.log("Request Body:", req.body); 
        const { services } = req.body;

        // Validate that services array is not empty
        if (!Array.isArray(services) || services.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Services are required.',
            });
        }

        // Create an array to hold the services for saving to the database
        let servicesToSave = [];

        // Process the provided services without checking for existing IDs
        for (const service of services) {
            const { serviceType, settings } = service;

            // Directly push the service data into the array
            servicesToSave.push({
                serviceType,
                settings,
            });
        }

        // Save the service details (including the processed services)
        const newServiceRequest = new ServicesMain({
            services: servicesToSave,
        });

        await newServiceRequest.save();

        // Respond with success
        return res.status(201).json({
            success: true,
            message: "Selected services saved successfully",
            data: newServiceRequest,
        });
    } catch (error) {
        console.error("Error creating service:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get service by ID
export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await ServicesMain.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        // Success response
        res.status(200).json({
            success: true,
            message: 'Service retrieved successfully',
            data: service,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

// Update service by ID
export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, selectedServices } = req.body;

        const updatedService = {
            title: title || null,  // Title is optional
            services: selectedServices,
        };

        const service = await ServicesMain.findByIdAndUpdate(id, updatedService, { new: true });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        // Success response
        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: service,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

// Delete service by ID
export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await ServicesMain.findByIdAndDelete(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        // Success response
        res.status(200).json({
            success: true,
            message: 'Service deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};
