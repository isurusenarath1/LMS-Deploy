const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const auth = require('../middleware/auth');
const siteSettingController = require('../controllers/siteSettingController');

// Prepare uploads/site directory
const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'site');
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
  console.error('Failed to create uploads site directory', uploadsDir, e);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Public: get settings
router.get('/', siteSettingController.getSettings);

// Admin: upload image for a key. Query param `key` required.
router.post('/upload', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req,res,next)=>next(), upload.single('file'), siteSettingController.uploadImage);

module.exports = router;
