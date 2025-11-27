const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const contactController = require('../controllers/contactController');

// Admin-only endpoints
router.get('/', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req,res,next)=>next(), contactController.adminListMessages);
router.get('/:id', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req,res,next)=>next(), contactController.adminGetMessage);
router.put('/:id/read', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req,res,next)=>next(), contactController.adminMarkRead);
router.delete('/:id', auth, auth.authorizeRole ? auth.authorizeRole('admin') : (req,res,next)=>next(), contactController.adminDeleteMessage);

module.exports = router;
