const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Year batch (e.g., 2026, 2027)
  year: { type: String, default: new Date().getFullYear().toString() },
  // Start date for the batch/class
  startDate: { type: Date },
  // Maximum number of students allowed
  maxStudents: { type: Number },
  // Price or fee for the class
  price: { type: String },
  // Duration text (e.g., '8 hours')
  duration: { type: String },
  // Schedule / recurring details
  schedule: { type: String },
  // Type: 'class' or 'course'
  type: { type: String, default: 'class' },
  // Status: Active, Cancelled, Draft
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', ClassSchema);
