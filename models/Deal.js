import mongoose from 'mongoose';

const movieStatusSchema = new mongoose.Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectInfo' },
    userId: { type: String },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'negotiation'],
        default: 'pending'
    },
    remarks: { type: String, default: '' }, // optional comments or negotiation notes
    updatedAt: { type: Date, default: Date.now }
});

const dealSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requirementTitle: {
        type: String,
        default: 'Untitled Requirement'
    },
    movies: [movieStatusSchema],
    rights: {
        type: String, 
    },
    usageRights: {
        type: String
    },
    includingRegions: {
        type: [String], // e.g., ['Asia', 'India']
        default: []
    },
    excludingCountries: {
        type: [String], // e.g., ['Pakistan', 'China']
        default: []
    },
    contentCategory: {
        type: [String], 
    },
    languages: {
        type: [String], // e.g., ['Hindi', 'English']
        default: []
    },
    genre: {
        type: [String], // e.g., ['Drama', 'Thriller']
        default: []
    },
    yearOfRelease: {
        type: [String], // e.g., ['2023', '2024']
        default: []
    },
    licenseTerm: {
        type: String
    },
    paymentTerms: {
        type: String
    },
    budgetRange: {
        min: { type: Number },
        max: { type: Number }
    },
    remarks: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    parentDealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', default: null },
    status: {
        type: String,
        enum: [
            'pending',
            'submitted_by_buyer',
            'admin_filtered_content',
            'curated_list_sent_to_buyer',
            'shortlisted_by_buyer',
            'sent_to_seller',
            'deal_verified',
            'in_negotiation_seller',
            'in_negotiation_buyer',
            'rejected_by_buyer',
            'rejected_by_seller',
            'deal_closed'
        ],
        default: 'submitted_by_buyer'
    },

    // Track all transitions (audit trail)
    history: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        }
    ],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Deal = mongoose.model('Deal', dealSchema);
export default Deal;
