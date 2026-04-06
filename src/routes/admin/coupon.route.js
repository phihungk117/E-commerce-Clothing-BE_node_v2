const express = require('express');
const { verifyToken, authorize } = require('../../middlewares/auth.middleware');
const couponController = require('../../controllers/coupon.controller');

const router = express.Router();

// All routes require Admin authentication
router.use(verifyToken, authorize('ADMIN'));

router.get('/', couponController.getAllCoupons);
router.get('/:id', couponController.getCouponById);
router.post('/', couponController.createCoupon);
router.patch('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);
router.get('/:id/usages', couponController.getCouponUsages);

module.exports = router;
