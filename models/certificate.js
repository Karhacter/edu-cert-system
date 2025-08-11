const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  studentName: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  ipfsHash: {
    type: String,
    required: true
  },
  isValid: {
    type: Boolean,
    default: true
  },
  txHash: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema); 