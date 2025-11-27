const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  target: {
    type: {
      type: String,
      enum: ['all', 'batch', 'user'],
      default: 'all'
    },
    batchYear: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
