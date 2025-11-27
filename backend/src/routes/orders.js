const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const orderController = require('../controllers/orderController');

// Create order (authenticated)
router.post('/', auth, orderController.createOrder);

// Get current user's orders
router.get('/my', auth, orderController.getMyOrders);

module.exports = router;

