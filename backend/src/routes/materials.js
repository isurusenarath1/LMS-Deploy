const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// configure multer for materials uploads
const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'materials');
// ensure uploads directory exists
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
  console.error('Failed to create uploads materials directory', uploadsDir, e);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname.replace(/[^a-z0-9._-]/gi, '_')}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

// Public
router.get('/', materialController.getMaterials);
router.get('/:id', materialController.getMaterial);

// Admin protected
router.post('/', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req,res,next)=>next(), upload.single('file'), materialController.createMaterial);
router.put('/:id', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req,res,next)=>next(), materialController.updateMaterial);
router.delete('/:id', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req,res,next)=>next(), materialController.deleteMaterial);

module.exports = router;
