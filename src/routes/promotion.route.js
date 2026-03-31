const express = require('express');
const promotionController = require('../controllers/promotion.controller');

const router = express.Router();

// Public routes
router.get('/', promotionController.getActivePromotions);
router.get('/:id', promotionController.getPromotionById);

module.exports = router;
