import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    movies: [{ movieId: String, projectTitle: String }],
    rights: [String],
    territory: [String],
    licenseTerm: [String],
    usageRights: [String],
    paymentTerms: [String],
    remarks: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: [
            'pending',
            'sent_to_shipper',
            'in_negotiation_shipper',
            'sent_to_seller',
            'in_negotiation_seller',
            'sent_to_buyer',
            'in_negotiation_buyer',
            'verified',
            'closed',
            'rejected_by_shipper',
            'rejected_by_seller',
            'rejected_by_buyer'
        ],
        default: 'pending'
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
