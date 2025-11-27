const Course = require('../models/Course');
const Month = require('../models/Month');
const Order = require('../models/Order');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Get all courses (optionally filter by year)
exports.getCourses = async (req, res) => {
  try {
    const { year, month } = req.query;
    const query = {}
    if (year) query.year = year
    if (month) query.month = month
    const courses = await Course.find(query).populate('instructor', 'name email').populate('students', 'name email').populate('month');

    // If month is specified and the month is paid, ensure only enrolled users (or admins) can access the actual sourceUrl.
    if (month) {
      try {
        const monthDoc = await Month.findById(month);
        if (monthDoc && monthDoc.price && monthDoc.price > 0) {
          // Determine requester user (if any)
          let requesterId = null;
          let requesterRole = null;
          const auth = req.headers.authorization;
          if (auth && auth.startsWith('Bearer ')) {
            try {
              const token = auth.split(' ')[1];
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              requesterId = decoded.id || decoded._id || null;
              if (requesterId) {
                const u = await User.findById(requesterId).select('role');
                if (u) requesterRole = u.role;
              }
            } catch (err) {
              // invalid token - treat as anonymous
            }
          }

          // Admins always allowed
          let allowed = false;
          if (requesterRole === 'admin') allowed = true;

          // If not admin, check orders to see if user purchased this month
          if (!allowed && requesterId) {
            const ord = await Order.findOne({ user: requesterId, 'items.monthId': String(month), $or: [{ status: 'completed' }, { 'payment.complete': true }, { 'payment.verified': true }] });
            if (ord) allowed = true;
          }

          // If not allowed, remove sensitive fields from courses (sourceUrl) and mark as locked
          if (!allowed) {
            const safe = courses.map(c => {
              const obj = c.toObject ? c.toObject() : { ...c };
              // hide actual source url to prevent direct access
              delete obj.sourceUrl;
              obj.locked = true;
              return obj;
            });
            return res.json({ success: true, courses: safe });
          }
        }
      } catch (err) {
        // if any error here, fall back to returning courses but safe
        console.error('Month access check error:', err);
      }
    }

    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single course
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name email').populate('students', 'name email').populate('month');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // if course belongs to a paid month, enforce access control similar to getCourses
    try {
      const monthDoc = course.month;
      if (monthDoc && monthDoc.price && monthDoc.price > 0) {
        let requesterId = null;
        let requesterRole = null;
        const auth = req.headers.authorization;
        if (auth && auth.startsWith('Bearer ')) {
          try {
            const token = auth.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            requesterId = decoded.id || decoded._id || null;
            if (requesterId) {
              const u = await User.findById(requesterId).select('role');
              if (u) requesterRole = u.role;
            }
          } catch (err) {
            // ignore
          }
        }

        let allowed = false;
        if (requesterRole === 'admin') allowed = true;
        if (!allowed && requesterId) {
          const ord = await Order.findOne({ user: requesterId, 'items.monthId': String(monthDoc._id), $or: [{ status: 'completed' }, { 'payment.complete': true }, { 'payment.verified': true }] });
          if (ord) allowed = true;
        }

        if (!allowed) {
          const obj = course.toObject ? course.toObject() : { ...course };
          delete obj.sourceUrl;
          obj.locked = true;
          return res.json({ success: true, course: obj });
        }
      }
    } catch (err) {
      console.error('Course access check error:', err);
    }

    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create course
exports.createCourse = async (req, res) => {
  try {
    const { lessonTitle, thumbnail, year, month, sourceType, sourceUrl, duration, price, description } = req.body;
    if (!lessonTitle || !year || !sourceType || !sourceUrl) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const course = new Course({
      lessonTitle,
      thumbnail,
      year,
      month,
      sourceType,
      sourceUrl,
      duration,
      price,
      description,
      instructor: req.user?.id
    });

    await course.save();
    await course.populate('instructor', 'name email');
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('instructor', 'name email').populate('students', 'name email');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
