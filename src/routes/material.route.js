const express = require('express');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const materialController = require('../controllers/material.controller');

const router = express.Router();

// Public routes
router.get('/', materialController.getMaterials);
router.get('/:id', materialController.getMaterialById);

// Admin routes
router.post('/', verifyToken, authorize('ADMIN', 'STAFF'), materialController.createMaterial);
router.patch('/:id', verifyToken, authorize('ADMIN', 'STAFF'), materialController.updateMaterial);
router.delete('/:id', verifyToken, authorize('ADMIN'), materialController.deleteMaterial);

module.exports = router;
