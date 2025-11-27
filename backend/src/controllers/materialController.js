const Material = require('../models/Material');
const path = require('path');
const fs = require('fs');

// GET /api/materials
exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.find().populate('month').sort({ createdAt: -1 }).lean();
    const host = `${req.protocol}://${req.get('host')}`;
    const transformed = materials.map(m => {
      const mm = { ...m };
      if (mm.filePath && String(mm.filePath).startsWith('/')) mm.fileUrl = `${host}${mm.filePath}`;
      return mm;
    });
    res.json({ success: true, materials: transformed });
  } catch (err) {
    console.error('getMaterials error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/materials/:id
exports.getMaterial = async (req, res) => {
  try {
    const m = await Material.findById(req.params.id).populate('month').lean();
    if (!m) return res.status(404).json({ success: false, message: 'Material not found' });
    const mm = { ...m };
    if (mm.filePath && String(mm.filePath).startsWith('/')) mm.fileUrl = `${req.protocol}://${req.get('host')}${mm.filePath}`;
    res.json({ success: true, material: mm });
  } catch (err) {
    console.error('getMaterial error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/materials (admin) - handle file upload via multer
exports.createMaterial = async (req, res) => {
  try {
    const { title, description, class: cls, batchYear, monthId } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });

    let filePath = null;
    let fileType = null;
    let fileSize = null;
    if (req.file) {
      // save relative path
      filePath = `/${path.join('uploads', 'materials', req.file.filename).replace(/\\/g, '/')}`;
      fileType = req.file.mimetype;
      fileSize = req.file.size;
    }

    const material = new Material({
      title,
      description: description || '',
      class: cls || '',
      batchYear: batchYear || null,
      month: monthId || null,
      filePath,
      fileType,
      fileSize,
      uploadedBy: req.user ? req.user._id : null
    });
    await material.save();
    res.status(201).json({ success: true, material });
  } catch (err) {
    console.error('createMaterial error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/materials/:id (admin)
exports.updateMaterial = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = { ...req.body };
    const material = await Material.findByIdAndUpdate(id, payload, { new: true });
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    res.json({ success: true, material });
  } catch (err) {
    console.error('updateMaterial error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/materials/:id (admin)
exports.deleteMaterial = async (req, res) => {
  try {
    const id = req.params.id;
    const material = await Material.findById(id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
    // remove file if exists
    if (material.filePath && String(material.filePath).startsWith('/')) {
      const fileOnDisk = path.join(__dirname, '..', '..', material.filePath.replace(/\//g, path.sep).replace(/^\\/, ''));
      if (fs.existsSync(fileOnDisk)) {
        try { fs.unlinkSync(fileOnDisk); } catch (e) { /* ignore */ }
      }
    }
    // delete document from DB (use findByIdAndDelete to avoid deprecated instance methods)
    await Material.findByIdAndDelete(id);
    res.json({ success: true, message: 'Material deleted' });
  } catch (err) {
    console.error('deleteMaterial error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
