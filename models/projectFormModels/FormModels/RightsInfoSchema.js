import mongoose from 'mongoose';

const RightsInfoGroupSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
    },

    userId: {
      type: String,
    },

    rights: [
      {
        name: { type: String },
        id: { type: Number },
      },
    ],

    territories: [
      {
        name: { type: String },
        id: { type: String }, // ✅ changed from Number to String
        country: { type: String },
        region: { type: String },
      },
    ],

    licenseTerm: [
      {
        name: { type: String },
        id: { type: Number },
      },
    ],

    platformType: [
      {
        name: { type: String },
        id: { type: Number },
      },
    ],

    usageRights: [
      {
        name: { type: String },
        id: { type: Number },
      },
    ],

    paymentTerms: [
      {
        name: { type: String },
        id: { type: Number },
      },
    ],

    listPrice: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('RightsInfoGroup', RightsInfoGroupSchema);
