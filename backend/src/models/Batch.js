const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  year: { type: String, required: true, unique: true },
  title: { type: String },
  description: { type: String },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', BatchSchema);
