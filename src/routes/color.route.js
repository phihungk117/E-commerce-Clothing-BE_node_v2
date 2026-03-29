const express = require('express');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const colorController = require('../controllers/color.controller');

const router = express.Router();

// Public routes
router.get('/', colorController.getColors);
router.get('/:id', colorController.getColorById);

// Admin routes
router.post('/', verifyToken, authorize('ADMIN', 'STAFF'), colorController.createColor);
router.patch('/:id', verifyToken, authorize('ADMIN', 'STAFF'), colorController.updateColor);
router.delete('/:id', verifyToken, authorize('ADMIN'), colorController.deleteColor);

module.exports = router;
