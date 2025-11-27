const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  class: { type: String },
  batchYear: { type: String },
  month: { type: mongoose.Schema.Types.ObjectId, ref: 'Month' },
  filePath: { type: String }, // relative path under /uploads
  fileType: { type: String },
  fileSize: { type: Number },
  downloads: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', MaterialSchema);
