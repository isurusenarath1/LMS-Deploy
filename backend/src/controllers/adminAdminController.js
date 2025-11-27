const User = require('../models/User');
const nodemailer = require('nodemailer');
const { generateStudentId } = require('../utils/studentId');

const getSmtpTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: user && pass ? { user, pass } : undefined });
};

const sendAccountCreatedEmail = async ({ to, name, password }) => {
  const from = process.env.SMTP_FROM || `no-reply@${process.env.SMTP_HOST || 'localhost'}`;
  const siteName = process.env.SITE_NAME || 'PPP Physics';
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@pppphysics.example';
  const frontend = process.env.FRONTEND_URL || '';
  const html = `<p>Hi ${name || ''},</p><p>An admin account has been created for you. Email: <strong>${to}</strong></p><p>Password: <strong>${password}</strong></p><p>Please sign in and change your password immediately.</p><p>If you did not expect this, contact ${supportEmail}.</p>`;
  const text = `An admin account was created for you at ${siteName}.
Email: ${to}
Password: ${password}

Please sign in and change your password immediately. If you did not expect this, contact ${supportEmail}.
`;
  let transport = getSmtpTransport();
  try {
    if (transport) {
      const info = await transport.sendMail({ from, to, subject: `${siteName} — Admin account created`, text, html });
      const preview = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : undefined;
      return { ok: true, previewUrl: preview };
    }
  } catch (err) {
    console.warn('Configured SMTP transport failed to send admin account email:', err && err.message ? err.message : err);
    transport = null;
  }
  if (process.env.NODE_ENV !== 'production') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      const ethTransport = nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, secure: false, auth: { user: testAccount.user, pass: testAccount.pass } });
      const info = await ethTransport.sendMail({ from, to, subject: `${siteName} — Admin account created (dev)`, text, html });
      const preview = nodemailer.getTestMessageUrl(info);
      return { ok: true, previewUrl: preview };
    } catch (ethErr) {
      console.error('Ethereal fallback failed for admin account email:', ethErr);
      return { ok: false, error: String(ethErr) };
    }
  }
  return { ok: false, error: 'no-transport' };
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.json({ success: true, admins });
  } catch (err) {
    console.error('Get admins error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id).select('-password');
    if (!admin || admin.role !== 'admin') return res.status(404).json({ success: false, message: 'Admin not found' });
    res.json({ success: true, admin });
  } catch (err) {
    console.error('Get admin error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createAdmin = async (req, res) => {
  const { name, email, password, phone, nic } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });
    const data = { name, email, password, phone, nic, role: 'admin' };
    const admin = await User.create(data);
    let emailResult = null;
    try { emailResult = await sendAccountCreatedEmail({ to: admin.email, name: admin.name, password }); } catch (e) { console.error('Admin account email error', e); }
    const resp = { success: true, message: 'Admin created', admin: { id: admin._id, name: admin.name, email: admin.email, phone: admin.phone, nic: admin.nic, createdAt: admin.createdAt } };
    if (emailResult && emailResult.previewUrl) resp.previewUrl = emailResult.previewUrl;
    if (emailResult && emailResult.ok === false && emailResult.error) resp.emailError = emailResult.error;
    res.status(201).json(resp);
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ success: false, message: 'Server error during admin creation' });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin') return res.status(404).json({ success: false, message: 'Admin not found' });
    const { name, email, phone, nic, password } = req.body;
    if (email && email !== admin.email) {
      const ex = await User.findOne({ email });
      if (ex) return res.status(400).json({ success: false, message: 'Email already exists' });
      admin.email = email;
    }
    if (name) admin.name = name;
    if (phone) admin.phone = phone;
    if (nic) admin.nic = nic;
    if (password) admin.password = password;
    await admin.save();
    res.json({ success: true, message: 'Admin updated', admin: { id: admin._id, name: admin.name, email: admin.email, phone: admin.phone, nic: admin.nic } });
  } catch (err) {
    console.error('Update admin error:', err);
    res.status(500).json({ success: false, message: 'Server error during admin update' });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin') return res.status(404).json({ success: false, message: 'Admin not found' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ success: false, message: 'Server error during admin deletion' });
  }
};
