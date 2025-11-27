const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Get notifications for current user
router.get('/', auth, notificationController.getMyNotifications);
// Mark notification as read
router.put('/:id/read', auth, notificationController.markAsRead);

module.exports = router;
