const Notification = require('../models/Notification');
const User = require('../models/User');

// Admin: create/send notification
const adminCreateNotification = async (req, res) => {
  try {
    const { title, message, target } = req.body;

    if (!title || !message || !target || !target.type) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const notif = new Notification({
      title,
      message,
      target,
      sender: req.user ? req.user._id : undefined
    });

    await notif.save();

    // Optionally compute recipients for auditing (not required for delivery)
    // If needed, populate recipients here in future.

    return res.json({ success: true, notification: notif });
  } catch (err) {
    console.error('adminCreateNotification error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: list notifications
const adminListNotifications = async (req, res) => {
  try {
    const list = await Notification.find({}).sort({ createdAt: -1 }).limit(200).lean();
    return res.json({ success: true, notifications: list });
  } catch (err) {
    console.error('adminListNotifications error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// User: get my notifications (all, batch, or direct)
const getMyNotifications = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const or = [
      { 'target.type': 'all' }
    ];

    if (user.batchYear) {
      or.push({ 'target.type': 'batch', 'target.batchYear': String(user.batchYear) });
    }

    or.push({ 'target.type': 'user', 'target.userId': user._id });

    const notifs = await Notification.find({ $or: or }).sort({ createdAt: -1 }).limit(100).lean();

    // Attach a small `isRead` flag for the user
    const enriched = notifs.map(n => ({
      ...n,
      isRead: Array.isArray(n.readBy) && n.readBy.some(id => String(id) === String(user._id))
    }));

    return res.json({ success: true, notifications: enriched });
  } catch (err) {
    console.error('getMyNotifications error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Mark as read for current user
const markAsRead = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    await Notification.findByIdAndUpdate(id, { $addToSet: { readBy: user._id } });

    return res.json({ success: true });
  } catch (err) {
    console.error('markAsRead error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  adminCreateNotification,
  adminListNotifications,
  getMyNotifications,
  markAsRead
};
