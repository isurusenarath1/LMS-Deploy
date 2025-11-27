const express = require('express');
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourse);

// Protected routes (require auth)
router.post('/', authMiddleware, courseController.createCourse);
router.put('/:id', authMiddleware, courseController.updateCourse);
router.delete('/:id', authMiddleware, courseController.deleteCourse);

module.exports = router;
