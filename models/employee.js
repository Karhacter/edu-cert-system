const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeAddress: {
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
    certificates: [
      {
        certificateId: String,
        courseName: String,
        issueDate: Date,
        ipfsHash: String,
        isValid: Boolean,
      },
    ],
  },
  { timestamps: true }
);

employeeSchema.index({ employeeAddress: 1 });
employeeSchema.index({ contractAddress: 1 });
employeeSchema.index({ isActive: 1 });

module.exports = mongoose.model("Employee", employeeSchema);
