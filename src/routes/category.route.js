const express = require('express');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const categoryController = require('../controllers/category.controller');

const router = express.Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin routes
router.post('/', verifyToken, authorize('ADMIN', 'STAFF'), categoryController.createCategory);
router.patch('/:id', verifyToken, authorize('ADMIN', 'STAFF'), categoryController.updateCategory);
router.delete('/:id', verifyToken, authorize('ADMIN'), categoryController.deleteCategory);

module.exports = router;
