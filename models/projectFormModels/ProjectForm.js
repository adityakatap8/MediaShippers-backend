import mongoose from 'mongoose';
import ProjectInfo from './FormModels/ProjectInfoSchema.js';
import SubmitterInfo from './FormModels/SubmitterInfoSchema.js';
import CreditsInfo from './FormModels/CreditsInfoSchema.js';
import SpecificationsInfo from './FormModels/SpecificationsInfo.js';
import ScreeningInfo from './FormModels/ScreeningInfoSchema.js';
import RightsInfo from './FormModels/RightsInfoSchema.js'; // Import the RightsInfo model

const projectFormSchema = new mongoose.Schema({
    projectInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectInfo', // Reference to ProjectInfo model
        required: true
    },
    submitterInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubmitterInfo', // Reference to SubmitterInfo model
        required: true
    },
    creditsInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CreditsInfo', // Reference to CreditsInfo model
        required: true
    },
    specificationsInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SpecificationsInfo', // Reference to SpecificationsInfo model
        required: true
    },
    screeningsInfo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ScreeningInfo', // Reference to ScreeningInfo model
        required: true
    }],
    rightsInfo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RightsInfo', // Reference to RightsInfo model
        required: true
    }]  // Add rightsInfo as an array of ObjectIds referencing RightsInfo model
}, { timestamps: true });

const ProjectForm = mongoose.model('ProjectForm', projectFormSchema);

export default ProjectForm;
