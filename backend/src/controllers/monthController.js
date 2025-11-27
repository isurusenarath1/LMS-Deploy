const Month = require('../models/Month');

// Get months (optionally filter by batchYear)
exports.getMonths = async (req, res) => {
  try {
    const { batchYear } = req.query;
    const query = batchYear ? { batchYear } : {};
    const months = await Month.find(query).sort({ createdAt: 1 });
    res.json({ success: true, months });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single month
exports.getMonth = async (req, res) => {
  try {
    const month = await Month.findById(req.params.id);
    if (!month) return res.status(404).json({ success: false, message: 'Month not found' });
    res.json({ success: true, month });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create month
exports.createMonth = async (req, res) => {
  try {
    const { name, batchYear, title, description, status, price, currency } = req.body;
    if (!name || !batchYear) return res.status(400).json({ success: false, message: 'Missing required fields' });
    const month = new Month({ name, batchYear, title, description, status, price: price || 0, currency: currency || 'LKR' });
    await month.save();
    res.status(201).json({ success: true, month });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update month
exports.updateMonth = async (req, res) => {
  try {
    // allow updating price/currency as well
    const payload = { ...req.body };
    if (payload.price === undefined) delete payload.price;
    if (payload.currency === undefined) delete payload.currency;
    const month = await Month.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!month) return res.status(404).json({ success: false, message: 'Month not found' });
    res.json({ success: true, month });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete month
exports.deleteMonth = async (req, res) => {
  try {
    const month = await Month.findByIdAndDelete(req.params.id);
    if (!month) return res.status(404).json({ success: false, message: 'Month not found' });
    res.json({ success: true, message: 'Month deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
