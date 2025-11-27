const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const classController = require('../controllers/classController');

router.get('/', classController.getClasses);
router.post('/', auth, classController.createClass);
router.get('/:id', classController.getClass);
router.put('/:id', auth, classController.updateClass);
router.delete('/:id', auth, classController.deleteClass);

module.exports = router;
