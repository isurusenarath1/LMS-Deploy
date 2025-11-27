const SiteSetting = require('../models/SiteSetting');
const path = require('path');

// Get site settings (create default if missing)
exports.getSettings = async (req, res) => {
  try {
    let settings = await SiteSetting.findOne();
    if (!settings) {
      settings = await SiteSetting.create({
        carousel: [],
        loginBg: '',
        registerBg: '',
        physicsImage: '',
        teacherImage: ''
      });
    }

    const obj = settings.toObject();
    // convert relative paths to absolute URLs when served
    ['loginBg', 'registerBg', 'physicsImage', 'teacherImage'].forEach(key => {
      if (obj[key] && String(obj[key]).startsWith('/')) {
        obj[key] = `${req.protocol}://${req.get('host')}${obj[key]}`;
      }
    });
    obj.carousel = (obj.carousel || []).map(item => item && String(item).startsWith('/') ? `${req.protocol}://${req.get('host')}${item}` : item);

    res.json({ success: true, settings: obj });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to load settings' });
  }
};

// Upload image for a specific key. Query params: key (carousel|loginBg|registerBg|physicsImage|teacherImage), index (for carousel optional)
exports.uploadImage = async (req, res) => {
  try {
    const key = req.query.key;
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const relativePath = path.join('uploads', 'site', req.file.filename).replace(/\\/g, '/');
    const storedPath = `/${relativePath}`;

    let settings = await SiteSetting.findOne();
    if (!settings) settings = await SiteSetting.create({ carousel: [] });

    if (key && key.startsWith('carousel')) {
      // key may be 'carousel' or 'carousel:0' or provide index query param
      const index = req.query.index !== undefined ? parseInt(req.query.index, 10) : undefined;
      if (typeof index === 'number' && !isNaN(index)) {
        settings.carousel[index] = storedPath;
      } else {
        settings.carousel.push(storedPath);
      }
    } else if (key === 'loginBg') {
      settings.loginBg = storedPath;
    } else if (key === 'registerBg') {
      settings.registerBg = storedPath;
    } else if (key === 'physicsImage') {
      settings.physicsImage = storedPath;
    } else if (key === 'teacherImage') {
      settings.teacherImage = storedPath;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid key specified' });
    }

    await settings.save();

    // return full URL
    const url = `${req.protocol}://${req.get('host')}${storedPath}`;
    res.json({ success: true, url, message: 'Image uploaded', settings });
  } catch (err) {
    console.error('Upload settings image error:', err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};
