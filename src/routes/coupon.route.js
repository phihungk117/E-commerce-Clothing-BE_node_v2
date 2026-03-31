const express = require('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const couponController = require('../controllers/coupon.controller');

const router = express.Router();

// Public route - validate coupon (optional auth for per-user limit check)
router.post('/validate', couponController.validateCoupon);

// Protected route - apply coupon (requires auth)
router.post('/apply', verifyToken, couponController.applyCoupon);

module.exports = router;
