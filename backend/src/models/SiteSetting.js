const mongoose = require('mongoose');

const SiteSettingSchema = new mongoose.Schema({
  carousel: [{ type: String }],
  loginBg: { type: String },
  registerBg: { type: String },
  physicsImage: { type: String },
  teacherImage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SiteSetting', SiteSettingSchema);
