const Class = require('../models/Class');

exports.createClass = async (req, res) => {
  try {
    const cls = await Class.create({ ...req.body, teacher: req.user._id });
    res.status(201).json(cls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getClasses = async (req, res) => {
  try {
    const query = {};
    // allow filtering by year batch: /api/classes?year=2026
    if (req.query.year) query.year = String(req.query.year);
    const classes = await Class.find(query).populate('teacher', 'name email');
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getClass = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id).populate('teacher', 'name email');
    if (!cls) return res.status(404).json({ message: 'Not found' });
    res.json(cls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cls) return res.status(404).json({ message: 'Not found' });
    res.json(cls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const cls = await Class.findByIdAndDelete(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
