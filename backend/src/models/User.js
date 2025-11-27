const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  studentId: { type: String, unique: true, sparse: true },
  phone: { type: String },
  profilePicture: { type: String },
  nic: { type: String },
  badge: { type: String, default: 'Bronze' },
  address: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  avgScore: { type: Number, default: 0 },
  // ID verification fields (set by admin when verifying physical ID / QR)
  idVerified: { type: Boolean, default: false },
  idVerifiedAt: { type: Date },
  // OTP verification for email (used during registration/login)
  otp: {
    code: { type: String },
    expires: { type: Date },
    verified: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
