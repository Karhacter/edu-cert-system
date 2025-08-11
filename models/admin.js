const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  ethAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['Employee', 'Organization'],
    required: true
  },
  txHash: {
    type: String,
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes for better query performance
adminSchema.index({ ethAddress: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ registeredAt: -1 });

module.exports = mongoose.model('Admin', adminSchema);
