const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOrderController = require('../controllers/adminOrderController');

// List payments and confirm payment actions (admin only)
router.get('/', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req, res, next) => next(), adminOrderController.listPayments);
router.put('/:id/confirm', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req, res, next) => next(), adminOrderController.confirmPayment);

module.exports = router;
