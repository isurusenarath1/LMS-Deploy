const mongoose = require('mongoose');

const TelegramChannelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  link: { type: String, required: true },
  meta: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('TelegramChannel', TelegramChannelSchema);
