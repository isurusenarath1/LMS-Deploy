const Batch = require('../models/Batch');

exports.createBatch = async (req, res) => {
  try {
    const { year, title, description, status } = req.body;
    if (!year) return res.status(400).json({ message: 'Year is required' });
    // ensure unique year
    const existing = await Batch.findOne({ year: String(year) });
    if (existing) return res.status(409).json({ message: 'Batch already exists' });
    const batch = await Batch.create({ year: String(year), title, description, status });
    res.status(201).json(batch);
  } catch (err) {
    console.error('createBatch error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.find().sort({ year: 1 });
    res.json(batches);
  } catch (err) {
    console.error('getBatches error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Not found' });
    res.json(batch);
  } catch (err) {
    console.error('getBatch error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!batch) return res.status(404).json({ message: 'Not found' });
    res.json(batch);
  } catch (err) {
    console.error('updateBatch error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteBatch error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
