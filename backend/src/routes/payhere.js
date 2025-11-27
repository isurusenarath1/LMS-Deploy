const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const auth = require('../middleware/auth');
const payhereController = require('../controllers/payhereController');

// create checkout payload (auth required)
router.post('/create', auth, express.json(), payhereController.createCheckout);

// PayHere will POST urlencoded data to notify_url
router.post('/notify', bodyParser.urlencoded({ extended: true }), payhereController.handleNotification);

module.exports = router;
