const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    organizationAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    contractAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    owner: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    endorsedCertificates: [
      {
        certificateId: String,
        endorsementDetails: String,
        endorsementDate: Date,
        txHash: String,
      },
    ],
    totalEndorsements: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

organizationSchema.index({ organizationAddress: 1 });
organizationSchema.index({ contractAddress: 1 });
organizationSchema.index({ isActive: 1 });
organizationSchema.index({ totalEndorsements: -1 });

module.exports = mongoose.model("Organization", organizationSchema);
