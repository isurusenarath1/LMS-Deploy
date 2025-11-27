const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAdminController = require('../controllers/adminAdminController');

// Admin user management
router.get('/', auth, adminAdminController.getAllAdmins);
router.post('/', auth, adminAdminController.createAdmin);
router.get('/:id', auth, adminAdminController.getAdminById);
router.put('/:id', auth, adminAdminController.updateAdmin);
router.delete('/:id', auth, adminAdminController.deleteAdmin);

module.exports = router;
