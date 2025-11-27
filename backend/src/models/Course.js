const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  lessonTitle: { type: String, required: true },
  thumbnail: { type: String }, // URL or base64 image
  year: { type: String, required: true }, // Year batch (e.g., 2026, 2027)
  month: { type: mongoose.Schema.Types.ObjectId, ref: 'Month' }, // optional month reference
  sourceType: { type: String, enum: ['youtube', 'zoom', 'teams'], required: true },
  sourceUrl: { type: String, required: true },
  duration: { type: String }, // e.g., "8 hours"
  price: { type: String }, // e.g., "Rs. 5000" or "Free"
  description: { type: String },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, default: 'Active', enum: ['Active', 'Inactive', 'Draft'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);
