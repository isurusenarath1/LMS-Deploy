const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const batchController = require('../controllers/batchController');

router.get('/', batchController.getBatches);
router.post('/', auth, batchController.createBatch);
router.get('/:id', batchController.getBatch);
router.put('/:id', auth, batchController.updateBatch);
router.delete('/:id', auth, batchController.deleteBatch);

module.exports = router;
