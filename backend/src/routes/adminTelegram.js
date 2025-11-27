const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const telegramController = require('../controllers/telegramController');

// Admin-protected CRUD
router.get('/', auth, telegramController.listAdmin);
router.post('/', auth, telegramController.create);
router.get('/:id', auth, telegramController.getById);
router.put('/:id', auth, telegramController.update);
router.delete('/:id', auth, telegramController.remove);

module.exports = router;
