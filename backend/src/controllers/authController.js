const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateStudentId } = require('../utils/studentId');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const getSmtpTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: user && pass ? { user, pass } : undefined
  });
};
const sendOtpEmail = async (to, code) => {
  // Try configured SMTP transport first. If not configured or send fails, and we're
  // in development, fall back to Ethereal (nodemailer test account) so devs can
  // inspect the message without a live SMTP server.
  let transport = getSmtpTransport();
  const from = process.env.SMTP_FROM || `no-reply@${process.env.SMTP_HOST || 'localhost'}`;
  const siteName = process.env.SITE_NAME || 'PPP Physics';
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@pppphysics.example';
  const logoUrl = process.env.SITE_LOGO_URL || null; // optional public logo URL
  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${siteName} — Verification Code</title>
    <style>
      .container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f6f9fc; padding:24px; }
      .card { max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; box-shadow:0 6px 18px rgba(28,37,52,0.08); overflow:hidden; }
      .header { background: linear-gradient(90deg,#0ea5a6,#7c3aed); color:#fff; padding:18px 24px; display:flex; gap:12px; align-items:center; }
      .logo { width:48px; height:48px; object-fit:contain; border-radius:8px; background:rgba(255,255,255,0.06); padding:6px }
      .title { font-size:18px; font-weight:700; }
      .body { padding:28px 24px; color:#1f2937; }
      .otp { display:block; margin:18px 0; text-align:center; font-size:32px; letter-spacing:6px; font-weight:800; color:#111827; background:#f3f4f6; padding:16px 12px; border-radius:8px; }
      .note { color:#6b7280; margin-top:6px; font-size:13px; }
      .btn { display:inline-block; margin-top:18px; background:#0ea5a6; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none; font-weight:600 }
      .footer { padding:18px 24px; font-size:12px; color:#9ca3af; text-align:center; }
      @media (max-width:420px){ .otp{font-size:26px; letter-spacing:4px } }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          ${logoUrl ? `<img src="${logoUrl}" alt="${siteName} logo" class="logo"/>` : ''}
          <div>
            <div class="title">${siteName} — Email Verification</div>
            <div style="font-size:12px; opacity:0.9">Your one-time sign-in code</div>
          </div>
        </div>
        <div class="body">
          <div style="font-size:15px">Hi,</div>
          <div style="margin-top:10px">Use the code below to complete your sign in or registration. The code is valid for <strong>10 minutes</strong>.</div>
          <div class="otp">${code}</div>
          <div class="note">If you didn't request this code, you can safely ignore this email or contact us.</div>
          <a class="btn" href="mailto:${supportEmail}">Contact Support</a>
        </div>
        <div class="footer">If you have trouble, paste the code into the app. This message was sent to <strong>${to}</strong>.</div>
      </div>
    </div>
  </body>
  </html>
  `;
  const text = `Your ${siteName} verification code is: ${code}\n\nThis code expires in 10 minutes. If you did not request this, contact ${supportEmail}.`;
  try {
    if (transport) {
      const info = await transport.sendMail({ from, to, subject: `${siteName} — Your verification code`, text, html });
      // attempt to get preview url if available
      const preview = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : undefined;
      return { ok: true, previewUrl: preview };
    }
  } catch (err) {
    console.warn('Configured SMTP transport failed to send OTP:', err && err.message ? err.message : err);
    transport = null;
  }

  // If no transport (or send failed) and not in production, use Ethereal for dev testing
  if (process.env.NODE_ENV !== 'production') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      const ethTransport = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      const info = await ethTransport.sendMail({ from, to, subject: `${siteName} — Your verification code (dev)`, text, html });
      const preview = nodemailer.getTestMessageUrl(info);
      console.info('Ethereal preview URL:', preview);
      return { ok: true, previewUrl: preview };
    } catch (ethErr) {
      console.error('Ethereal fallback failed:', ethErr);
      return { ok: false, error: String(ethErr) };
    }
  }

  console.warn('OTP email not sent (no transport available)');
  return { ok: false, error: 'no-transport' };
};

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const formatUserResponse = (user, req) => {
  const userObj = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    phone: user.phone,
    nic: user.nic,
    badge: user.badge,
    address: user.address,
    createdAt: user.createdAt
  };
  if (user.profilePicture) {
    const pic = String(user.profilePicture);
    if (pic.startsWith('/')) {
      // build full url from request
      userObj.profilePicture = `${req.protocol}://${req.get('host')}${pic}`;
    } else {
      userObj.profilePicture = pic;
    }
  }
  return userObj;
};

exports.register = async (req, res) => {
  const { name, email, password, phone, nic, badge } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const studentData = {
      name,
      email,
      password,
      phone,
      nic,
      badge: badge || 'Bronze',
      role: 'student'
    };

    // Generate studentId for students
    try {
      studentData.studentId = await generateStudentId();
    } catch (idErr) {
      console.error('Student ID generation error:', idErr);
      // proceed without studentId (it will be empty) but log error
    }

    user = await User.create(studentData);

    // generate OTP and send via SMTP
    try {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      user.otp = { code, expires: new Date(Date.now() + 10 * 60 * 1000), verified: false };
      await user.save();
      const sendResult = await sendOtpEmail(user.email, code);
      const resp = { success: true, needsOtp: true, email: user.email, message: 'OTP sent to email' };
      if (sendResult && sendResult.previewUrl) resp.previewUrl = sendResult.previewUrl;
      if (sendResult && sendResult.ok === false && sendResult.error) resp.sendError = sendResult.error;
      return res.status(201).json(resp);
    } catch (otpErr) {
      console.error('OTP send error:', otpErr);
      // fallback: return account created but not verified
      const token = generateToken(user);
      return res.status(201).json({ success: true, token, user: formatUserResponse(user, req) });
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    // generate OTP for login and send via SMTP
    try {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      user.otp = { code, expires: new Date(Date.now() + 10 * 60 * 1000), verified: false };
      await user.save();
      const sendResult = await sendOtpEmail(user.email, code);
      const resp = { success: true, needsOtp: true, email: user.email, message: 'OTP sent to email' };
      if (sendResult && sendResult.previewUrl) resp.previewUrl = sendResult.previewUrl;
      if (sendResult && sendResult.ok === false && sendResult.error) resp.sendError = sendResult.error;
      return res.json(resp);
    } catch (otpErr) {
      console.error('OTP send error (login):', otpErr);
      const token = generateToken(user);
      return res.json({ success: true, token, user: formatUserResponse(user, req) });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ success: false, message: 'Email and code required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.otp || !user.otp.code) return res.status(400).json({ success: false, message: 'No OTP requested' });
    if (user.otp.expires && new Date() > new Date(user.otp.expires)) return res.status(400).json({ success: false, message: 'OTP expired' });
    if (String(user.otp.code) !== String(code)) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    user.otp.verified = true;
    user.otp.code = undefined;
    user.otp.expires = undefined;
    await user.save();
    const token = generateToken(user);
    return res.json({ success: true, token, user: formatUserResponse(user, req) });
  } catch (err) {
    console.error('verifyOtp error', err);
    res.status(500).json({ success: false, message: 'Server error verifying OTP' });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // generate and save new OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    user.otp = { code, expires: new Date(Date.now() + 10 * 60 * 1000), verified: false };
    await user.save();

    const sendResult = await sendOtpEmail(user.email, code);
    const resp = { success: true, message: 'OTP resent' };
    if (sendResult && sendResult.previewUrl) resp.previewUrl = sendResult.previewUrl;
    if (sendResult && sendResult.ok === false && sendResult.error) resp.sendError = sendResult.error;
    return res.json(resp);
  } catch (err) {
    console.error('resendOtp error', err);
    res.status(500).json({ success: false, message: 'Server error resending OTP' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = req.user;
    res.json({ 
      success: true,
      user: formatUserResponse(user, req)
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const user = req.user;
    const token = generateToken(user);
    res.json({ 
      success: true,
      token 
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  res.json({ 
    success: true,
    message: 'Logged out successfully' 
  });
};
