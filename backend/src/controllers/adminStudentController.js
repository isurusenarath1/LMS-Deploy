const User = require('../models/User');
const { generateStudentId } = require('../utils/studentId');
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
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined
  });
};

const sendAccountCreatedEmail = async ({ to, name, password }) => {
  const from = process.env.SMTP_FROM || `no-reply@${process.env.SMTP_HOST || 'localhost'}`;
  const siteName = process.env.SITE_NAME || 'PPP Physics';
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@pppphysics.example';
  const logoUrl = process.env.SITE_LOGO_URL || null;
  const frontend = process.env.FRONTEND_URL || '';

  const html = `
  <!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${siteName} — Account Created</title>
  <style>
    body{font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f6f9fc; margin:0}
    .wrap{max-width:600px;margin:24px auto}
    .card{background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 6px 18px rgba(28,37,52,0.08)}
    .hdr{background:linear-gradient(90deg,#0ea5a6,#7c3aed);color:#fff;padding:18px;display:flex;gap:12px;align-items:center}
    .logo{width:44px;height:44px;border-radius:8px;background:rgba(255,255,255,0.06);padding:6px}
    .body{padding:22px;color:#111827}
    .cred{background:#f3f4f6;padding:12px;border-radius:8px;font-weight:700;letter-spacing:1px;margin:14px 0}
    .btn{display:inline-block;padding:10px 14px;background:#0ea5a6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600}
    .foot{padding:14px 18px;font-size:12px;color:#9ca3af;text-align:center}
  </style></head><body>
  <div class="wrap"><div class="card">
    <div class="hdr">${logoUrl ? `<img src="${logoUrl}" class="logo" alt="${siteName} logo"/>` : ''}
      <div><strong>${siteName}</strong><div style="font-size:12px;opacity:0.95">Student account created</div></div>
    </div>
    <div class="body">
      <p>Hi ${name || ''},</p>
      <p>An account has been created for you by the administration. Use the credentials below to sign in, then immediately change your password from your profile for security.</p>
      <div class="cred">Email: ${to}<br/>Password: ${password}</div>
      <p><a class="btn" href="${frontend || '#'}">Go to Sign In</a></p>
      <p style="color:#6b7280;font-size:13px">If you did not expect this account, contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
    </div>
    <div class="foot">This message was sent to ${to}. Keep your password secure.</div>
  </div></div></body></html>
  `;

  const text = `An account was created for you at ${siteName}.

  Email: ${to}
  Password: ${password}

  Please sign in and change your password immediately. If you did not expect this, contact ${supportEmail}.
  `;

  let transport = getSmtpTransport();
  try {
    if (transport) {
      const info = await transport.sendMail({ from, to, subject: `${siteName} — Your new account`, text, html });
      const preview = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : undefined;
      return { ok: true, previewUrl: preview };
    }
  } catch (err) {
    console.warn('Configured SMTP transport failed to send account email:', err && err.message ? err.message : err);
    transport = null;
  }

  if (process.env.NODE_ENV !== 'production') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      const ethTransport = nodemailer.createTransport({ host: 'smtp.ethereal.email', port: 587, secure: false, auth: { user: testAccount.user, pass: testAccount.pass } });
      const info = await ethTransport.sendMail({ from, to, subject: `${siteName} — Your new account (dev)`, text, html });
      const preview = nodemailer.getTestMessageUrl(info);
      console.info('Ethereal preview URL (account email):', preview);
      return { ok: true, previewUrl: preview };
    } catch (ethErr) {
      console.error('Ethereal fallback failed for account email:', ethErr);
      return { ok: false, error: String(ethErr) };
    }
  }

  return { ok: false, error: 'no-transport' };
};

const Course = require('../models/Course');
const Order = require('../models/Order');
const Month = require('../models/Month');

// return months in which the student is enrolled (distinct) and months purchased
exports.getStudentMonths = async (req, res) => {
  try {
    const studentId = req.params.id;
    if (!studentId) return res.status(400).json({ success: false, message: 'Student id required' });

    // 1) Find courses that include the student and have a month
    const courses = await Course.find({ students: studentId }).populate('month');

    // map months by id, include course info and mark as enrolled
    const monthsMap = {};
    courses.forEach(c => {
      if (c && c.month) {
        const m = c.month;
        const key = String(m._id);
        monthsMap[key] = Object.assign(monthsMap[key] || {}, {
          id: m._id,
          _id: m._id,
          name: m.name,
          title: m.title,
          price: m.price,
          currency: m.currency,
          enrolled: true,
          courses: (monthsMap[key] && monthsMap[key].courses) ? monthsMap[key].courses.concat([{ id: c._id, name: c.name }]) : [{ id: c._id, name: c.name }]
        });
      }
    });

    // 2) Find completed orders for this user and collect purchased monthIds
    const orders = await Order.find({ user: studentId, status: 'completed' }).lean();
    const purchasedByMonth = {}; // monthId -> array of { orderId, purchasedAt, item }
    orders.forEach(o => {
      (o.items || []).forEach(it => {
        const mid = it.monthId || it.id;
        if (!mid) return;
        const key = String(mid);
        purchasedByMonth[key] = purchasedByMonth[key] || [];
        purchasedByMonth[key].push({ orderId: o._id, purchasedAt: o.createdAt, item: it });
      });
    });

    // 3) For purchased monthIds that are not in monthsMap, try to fetch Month docs to include metadata
    const purchasedMonthIds = Object.keys(purchasedByMonth);
    if (purchasedMonthIds.length) {
      const monthDocs = await Month.find({ _id: { $in: purchasedMonthIds } }).lean();
      monthDocs.forEach(m => {
        const key = String(m._id);
        monthsMap[key] = Object.assign(monthsMap[key] || {}, {
          id: m._id,
          _id: m._id,
          name: m.name,
          title: m.title,
          price: m.price,
          currency: m.currency,
          courses: monthsMap[key] ? monthsMap[key].courses : [],
          enrolled: monthsMap[key] ? monthsMap[key].enrolled : false
        });
      });
    }

    // 4) Attach purchased info to monthsMap entries
    Object.keys(purchasedByMonth).forEach(mid => {
      if (!monthsMap[mid]) {
        // create a minimal entry
        monthsMap[mid] = { id: mid, _id: mid, name: `Month ${mid}`, title: '', price: null, currency: null, enrolled: false, courses: [] };
      }
      monthsMap[mid].purchased = true;
      monthsMap[mid].purchases = purchasedByMonth[mid];
    });

    const months = Object.values(monthsMap);
    return res.json({ success: true, months });
  } catch (err) {
    console.error('getStudentMonths error', err);
    return res.status(500).json({ success: false, message: 'Server error fetching months' });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');

    // compute enrolled months count per student by aggregating courses that reference a month
    // aggregation: match courses with a month, unwind students array, group by student id and count
    const agg = await Course.aggregate([
      { $match: { month: { $exists: true, $ne: null } } },
      { $unwind: '$students' },
      { $group: { _id: '$students', count: { $sum: 1 } } }
    ]).allowDiskUse(true);

    const countsMap = {};
    (agg || []).forEach(r => { countsMap[String(r._id)] = r.count; });

    const studentsWithCounts = students.map(s => ({ ...s.toObject(), enrolledMonthsCount: countsMap[String(s._id)] || 0 }));

    res.json({ success: true, students: studentsWithCounts });
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// small helper to escape regex special characters
function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.json({ success: true, student });
  } catch (err) {
    console.error('Get student error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createStudent = async (req, res) => {
  const { name, email, password, phone, nic, badge, address } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  try {
    const existingStudent = await User.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const studentData = {
      name,
      email,
      password,
      phone,
      nic,
      badge,
      address,
      role: 'student'
    };
    try {
      studentData.studentId = await generateStudentId();
    } catch (idErr) {
      console.error('Student ID generation error:', idErr);
    }

    const student = await User.create(studentData);

    // send account creation email (include provided password)
    let emailResult = null;
    try {
      // do not log the password; only include in the email payload
      emailResult = await sendAccountCreatedEmail({ to: student.email, name: student.name, password });
    } catch (e) {
      console.error('Account email send error:', e);
    }

    const resp = {
      success: true,
      message: 'Student created successfully',
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        phone: student.phone,
        nic: student.nic,
        badge: student.badge,
        address: student.address,
        role: student.role,
        createdAt: student.createdAt
      }
    };
    if (emailResult && emailResult.previewUrl) resp.previewUrl = emailResult.previewUrl;
    if (emailResult && emailResult.ok === false && emailResult.error) resp.emailError = emailResult.error;

    res.status(201).json(resp);
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ success: false, message: 'Server error during student creation' });
  }
};

exports.updateStudent = async (req, res) => {
  const { name, email, phone, nic, badge, address } = req.body;

  // allow updating status and password via admin
  const { status, password, avgScore } = req.body;

  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== student.email) {
      const existingStudent = await User.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
      student.email = email;
    }

    if (name) student.name = name;
    if (phone) student.phone = phone;
    if (nic) student.nic = nic;
    if (badge) student.badge = badge;
    if (address) student.address = address;
    if (status) student.status = status;
    if (typeof avgScore !== 'undefined') student.avgScore = avgScore;
    if (password) student.password = password;

    await student.save();

    res.json({ 
      success: true, 
      message: 'Student updated successfully',
      student: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        phone: student.phone,
        nic: student.nic,
        badge: student.badge,
        address: student.address,
        role: student.role,
        createdAt: student.createdAt
      }
    });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ success: false, message: 'Server error during student update' });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ success: false, message: 'Server error during student deletion' });
  }
};

// Verify student identity by NIC or studentId (triggered by scanning QR or manual input)
exports.verifyStudent = async (req, res) => {
  try {
    // log incoming body for debugging
    console.debug('verifyStudent received body:', req.body);

    let { nic, studentId, id, value } = req.body;

    // If client sent a generic 'value' field (some scanners do), use it
    if (!nic && !studentId && !id && value) {
      nic = value;
      studentId = value;
    }

    // If still empty, but body contains a single string field, try to use that
    if (!nic && !studentId && !id && typeof req.body === 'object') {
      const keys = Object.keys(req.body || {});
      if (keys.length === 1) {
        const v = req.body[keys[0]];
        if (typeof v === 'string') {
          nic = v;
          studentId = v;
        }
      }
    }

    let { } = req.body;
    let _debugAttempt = '';
    
    let _rawNic = nic;
    let _rawSid = studentId;

  nic = nic ? String(nic).trim() : '';
  studentId = studentId ? String(studentId).trim() : '';
  id = id ? String(id).trim() : '';

  // strip common QR prefixes like "PPP-PHYSICS-STUDENT:..."
  const stripPrefix = (s) => s.replace(/^.*?:/, '').trim();
  if (nic) nic = stripPrefix(nic);
  if (studentId) studentId = stripPrefix(studentId);

  _debugAttempt = nic || studentId || id || '';

    if (!nic && !studentId && !id) {
      return res.status(400).json({ success: false, message: 'Provide nic or studentId or id to verify' });
    }

    // Build flexible query: try exact, case-insensitive, and compact (remove non-alphanum) matches
    const orClauses = [];
    if (id) orClauses.push({ _id: id });
    if (studentId) {
      orClauses.push({ studentId });
      orClauses.push({ studentId: { $regex: new RegExp('^' + escapeRegex(studentId) + '$', 'i') } });
      const compactSid = studentId.replace(/[^a-zA-Z0-9]/g, '');
      if (compactSid) orClauses.push({ studentId: { $regex: compactSid, $options: 'i' } });
    }
    if (nic) {
      orClauses.push({ nic });
      orClauses.push({ nic: { $regex: new RegExp('^' + escapeRegex(nic) + '$', 'i') } });
      const compact = nic.replace(/[^a-zA-Z0-9]/g, '');
      if (compact) orClauses.push({ nic: { $regex: compact, $options: 'i' } });
    }

    const query = orClauses.length ? { $or: orClauses } : {};

    console.debug('verifyStudent query:', JSON.stringify(query));
    const student = await User.findOne(query).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found', attempted: _debugAttempt });
    }

    // Mark verified (idVerified and timestamp)
    student.idVerified = true;
    student.idVerifiedAt = new Date();
    await student.save();

    res.json({ success: true, message: 'Student identity verified', student: {
      id: student._id,
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      nic: student.nic,
      phone: student.phone,
      badge: student.badge,
      address: student.address,
      idVerified: student.idVerified,
      idVerifiedAt: student.idVerifiedAt
    }});
  } catch (err) {
    console.error('Verify student error:', err);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};
