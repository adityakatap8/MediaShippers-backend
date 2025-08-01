import mongoose from 'mongoose';

const RightsGroupSchema = new mongoose.Schema({
  rights: [
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
  listPrice: {
    type: String,
  },
  territories: {
    includedRegions: [
      {
        name: { type: String },
        id: { type: String },
      },
    ],
    excludeCountries: [
      {
        name: { type: String },
        id: { type: String },
        selected: { type: Boolean },
        region: { type: String },
      },
    ],
  },
});

const RightsInfoGroupSchema = new mongoose.Schema(
  {
    projectName: { type: String },
    userId: { type: String },
    rightsGroups: [RightsGroupSchema], // 🆕 Store multiple groups here
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('RightsInfoGroup', RightsInfoGroupSchema);
