const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Public route to submit contact messages
router.post('/', contactController.createMessage);

module.exports = router;
