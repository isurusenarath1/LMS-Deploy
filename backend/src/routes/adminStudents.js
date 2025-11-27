const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminStudentController = require('../controllers/adminStudentController');

// Only admin can access these routes - add admin check middleware if needed
router.get('/', auth, adminStudentController.getAllStudents);
router.post('/', auth, adminStudentController.createStudent);
// Verify student identity (QR / manual)
router.post('/verify', auth, adminStudentController.verifyStudent);
router.get('/:id', auth, adminStudentController.getStudentById);
router.get('/:id/months', auth, adminStudentController.getStudentMonths);
router.put('/:id', auth, adminStudentController.updateStudent);
router.delete('/:id', auth, adminStudentController.deleteStudent);

module.exports = router;
