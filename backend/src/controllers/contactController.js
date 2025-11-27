const ContactMessage = require('../models/ContactMessage');

// Public: POST /api/contact - submit a contact message
exports.createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const cm = new ContactMessage({ name, email, subject, message });
    await cm.save();

    res.json({ success: true, message: 'Message received' });
  } catch (err) {
    console.error('createMessage error', err);
    res.status(500).json({ success: false, message: 'Server error saving message' });
  }
};

// Admin: GET /api/admin/contacts - list messages
exports.adminListMessages = async (req, res) => {
  try {
    const msgs = await ContactMessage.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, messages: msgs });
  } catch (err) {
    console.error('adminListMessages error', err);
    res.status(500).json({ success: false, message: 'Server error listing messages' });
  }
};

// Admin: GET /api/admin/contacts/:id - get message
exports.adminGetMessage = async (req, res) => {
  try {
    const id = req.params.id;
    const msg = await ContactMessage.findById(id).lean();
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: msg });
  } catch (err) {
    console.error('adminGetMessage error', err);
    res.status(500).json({ success: false, message: 'Server error fetching message' });
  }
};

// Admin: PUT /api/admin/contacts/:id/read - mark read
exports.adminMarkRead = async (req, res) => {
  try {
    const id = req.params.id;
    const msg = await ContactMessage.findById(id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    msg.read = true;
    await msg.save();
    res.json({ success: true, message: 'Marked read' });
  } catch (err) {
    console.error('adminMarkRead error', err);
    res.status(500).json({ success: false, message: 'Server error updating message' });
  }
};

// Admin: DELETE /api/admin/contacts/:id - delete message
exports.adminDeleteMessage = async (req, res) => {
  try {
    const id = req.params.id;
    const msg = await ContactMessage.findById(id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    await msg.remove();
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    console.error('adminDeleteMessage error', err);
    res.status(500).json({ success: false, message: 'Server error deleting message' });
  }
};
