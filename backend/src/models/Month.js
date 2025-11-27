const mongoose = require('mongoose');

const MonthSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "January", "Month 1"
  batchYear: { type: String, required: true }, // reference to year batch (string year)
  title: { type: String },
  // price in smallest currency unit (e.g., LKR) - 0 means free
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'LKR' },
  description: { type: String },
  status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// update `updatedAt` on save
MonthSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Month', MonthSchema);
