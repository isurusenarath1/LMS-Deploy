const express = require('express');
const monthController = require('../controllers/monthController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public
router.get('/', monthController.getMonths);
router.get('/:id', monthController.getMonth);

// Protected
router.post('/', authMiddleware, monthController.createMonth);
router.put('/:id', authMiddleware, monthController.updateMonth);
router.delete('/:id', authMiddleware, monthController.deleteMonth);

module.exports = router;
