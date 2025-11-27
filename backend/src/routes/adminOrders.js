const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOrderController = require('../controllers/adminOrderController');

// Require admin role
router.get('/', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req, res, next) => next(), adminOrderController.listOrders);
router.get('/:id', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req, res, next) => next(), adminOrderController.getOrder);
router.put('/:id', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req, res, next) => next(), adminOrderController.updateOrder);
router.delete('/:id', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req, res, next) => next(), adminOrderController.deleteOrder);

module.exports = router;
