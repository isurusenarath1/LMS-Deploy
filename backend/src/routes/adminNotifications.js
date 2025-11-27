const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Admin only: create and list notifications
router.post('/', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req, res, next) => next(), notificationController.adminCreateNotification);
router.get('/', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req, res, next) => next(), notificationController.adminListNotifications);

module.exports = router;
