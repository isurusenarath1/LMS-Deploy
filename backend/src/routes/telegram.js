const express = require('express');
const router = express.Router();
const telegramController = require('../controllers/telegramController');

// Public listing of channels
router.get('/', telegramController.listPublic);

module.exports = router;
