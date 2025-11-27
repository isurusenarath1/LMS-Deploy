const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
const multer = require('multer');
const path = require('path');

// configure multer storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '..', '..', 'uploads', 'avatars'));
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		const name = `${req.user ? req.user._id : Date.now()}-${Date.now()}${ext}`;
		cb(null, name);
	}
});
const upload = multer({ storage });

// All these routes require authentication
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.post('/change-password', auth, userController.changePassword);
// Upload profile picture (multipart/form-data)
router.post('/profile/photo', auth, upload.single('avatar'), userController.uploadProfilePicture);
// Get classes the authenticated user is enrolled in
router.get('/classes', auth, userController.getMyClasses);

module.exports = router;
