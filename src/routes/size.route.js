const express = require('express');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const sizeController = require('../controllers/size.controller');

const router = express.Router();

// Public routes
router.get('/', sizeController.getSizes);
router.get('/:id', sizeController.getSizeById);

// Admin routes
router.post('/', verifyToken, authorize('ADMIN', 'STAFF'), sizeController.createSize);
router.patch('/:id', verifyToken, authorize('ADMIN', 'STAFF'), sizeController.updateSize);
router.delete('/:id', verifyToken, authorize('ADMIN'), sizeController.deleteSize);

module.exports = router;
