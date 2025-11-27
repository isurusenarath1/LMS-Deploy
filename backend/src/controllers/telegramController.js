const TelegramChannel = require('../models/TelegramChannel');

exports.listPublic = async (req, res) => {
  try {
    const channels = await TelegramChannel.find().sort({ createdAt: -1 });
    res.json({ success: true, channels });
  } catch (err) {
    console.error('listPublic telegram err', err);
    res.status(500).json({ success: false, message: 'Failed to list channels' });
  }
};

exports.listAdmin = async (req, res) => {
  try {
    const channels = await TelegramChannel.find().sort({ createdAt: -1 });
    res.json({ success: true, channels });
  } catch (err) {
    console.error('listAdmin telegram err', err);
    res.status(500).json({ success: false, message: 'Failed to list channels' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, link, meta } = req.body;
    if (!name || !link) return res.status(400).json({ success: false, message: 'Name and link are required' });
    const c = new TelegramChannel({ name, description, link, meta });
    await c.save();
    res.json({ success: true, channel: c });
  } catch (err) {
    console.error('create telegram err', err);
    res.status(500).json({ success: false, message: 'Failed to create channel' });
  }
};

exports.getById = async (req, res) => {
  try {
    const c = await TelegramChannel.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, channel: c });
  } catch (err) {
    console.error('getById telegram err', err);
    res.status(500).json({ success: false, message: 'Failed to get channel' });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, description, link, meta } = req.body;
    const c = await TelegramChannel.findByIdAndUpdate(req.params.id, { name, description, link, meta }, { new: true });
    if (!c) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, channel: c });
  } catch (err) {
    console.error('update telegram err', err);
    res.status(500).json({ success: false, message: 'Failed to update channel' });
  }
};

exports.remove = async (req, res) => {
  try {
    const c = await TelegramChannel.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('remove telegram err', err);
    res.status(500).json({ success: false, message: 'Failed to remove channel' });
  }
};
