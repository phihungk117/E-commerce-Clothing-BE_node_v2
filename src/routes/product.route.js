const express = require('express');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');
const productVariantController = require('../controllers/productVariant.controller');
const productImageController = require('../controllers/productImage.controller');

const router = express.Router();

// ==================== Product Routes ====================
// Public routes
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/filters', productController.getFilterOptions);
router.get('/:id', productController.getProductById);

// Protected routes (Admin/Staff)
router.post('/', verifyToken, authorize('ADMIN', 'STAFF'), productController.createProduct);
router.patch('/:id', verifyToken, authorize('ADMIN', 'STAFF'), productController.updateProduct);
router.delete('/:id', verifyToken, authorize('ADMIN', 'STAFF'), productController.deleteProduct);

// ==================== Product Variant Routes ====================
// Public routes
router.get('/:productId/variants', productVariantController.getVariantsByProduct);

// Protected routes (Admin/Staff)
router.post('/:productId/variants', verifyToken, authorize('ADMIN', 'STAFF'), productVariantController.createVariant);
router.patch('/:productId/variants/:id', verifyToken, authorize('ADMIN', 'STAFF'), productVariantController.updateVariant);
router.delete('/:productId/variants/:id', verifyToken, authorize('ADMIN', 'STAFF'), productVariantController.deleteVariant);
router.patch('/:productId/variants/:id/stock', verifyToken, authorize('ADMIN', 'STAFF'), productVariantController.updateStock);

// ==================== Product Image Routes ====================
// Public routes
router.get('/:productId/images', productImageController.getImagesByProduct);

// Protected routes (Admin/Staff)
router.post('/:productId/images', verifyToken, authorize('ADMIN', 'STAFF'), productImageController.createImage);
router.patch('/:productId/images/:id', verifyToken, authorize('ADMIN', 'STAFF'), productImageController.updateImage);
router.delete('/:productId/images/:id', verifyToken, authorize('ADMIN', 'STAFF'), productImageController.deleteImage);
router.patch('/:productId/images/:id/thumbnail', verifyToken, authorize('ADMIN', 'STAFF'), productImageController.setThumbnail);
router.put('/:productId/images/reorder', verifyToken, authorize('ADMIN', 'STAFF'), productImageController.reorderImages);

module.exports = router;