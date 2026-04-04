const express = require('express');
const { verifyToken, authorize } = require('../../middlewares/auth.middleware');
const promotionController = require('../../controllers/promotion.controller');

const router = express.Router();

// All routes require Admin authentication
router.use(verifyToken, authorize('ADMIN'));

router.get('/', promotionController.getAllPromotions);
router.get('/:id', promotionController.getPromotionById);
router.post('/', promotionController.createPromotion);
router.patch('/:id', promotionController.updatePromotion);
router.delete('/:id', promotionController.deletePromotion);
router.post('/:id/products', promotionController.addProductsToPromotion);
router.delete('/:id/products/:productId', promotionController.removeProductFromPromotion);

module.exports = router;
