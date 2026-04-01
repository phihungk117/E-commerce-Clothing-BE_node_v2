const express = require('express');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const usageController = require('../controllers/usage.controller');

const router = express.Router();

// Public routes
router.get('/', usageController.getUsages);
router.get('/:id', usageController.getUsageById);

// Admin routes
router.post('/', verifyToken, authorize('ADMIN', 'STAFF'), usageController.createUsage);
router.patch('/:id', verifyToken, authorize('ADMIN', 'STAFF'), usageController.updateUsage);
router.delete('/:id', verifyToken, authorize('ADMIN'), usageController.deleteUsage);

module.exports = router;
