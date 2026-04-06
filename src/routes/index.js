const express = require('express');
const healthRoute = require('./health.route');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const addressRoute = require('./address.route');
const categoryRoute = require('./category.route');
const colorRoute = require('./color.route');
const sizeRoute = require('./size.route');
const materialRoute = require('./material.route');
const usageRoute = require('./usage.route');
const promotionRoute = require('./promotion.route');
const couponRoute = require('./coupon.route');

const adminUserRoute = require('./admin/user.route');
const adminPromotionRoute = require('./admin/promotion.route');
const adminCouponRoute = require('./admin/coupon.route');
const adminOrderRoute = require('./admin/order.route');
const adminDashboardRoute = require('./admin/dashboard.route');
const adminReviewRoute = require('./admin/review.route');
const adminInventoryRoute = require('./admin/inventory.route');

const router = express.Router();

router.use('/health', healthRoute);
router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/addresses', addressRoute);
router.use('/products', require('./product.route'));
router.use('/categories', categoryRoute);
router.use('/colors', colorRoute);
router.use('/sizes', sizeRoute);
router.use('/materials', materialRoute);
router.use('/usages', usageRoute);
router.use('/promotions', promotionRoute);
router.use('/coupons', couponRoute);
router.use('/cart', require('./cart.route'));
router.use('/orders', require('./order.route'));
router.use('/reviews', require('./review.route'));
router.use('/wishlist', require('./wishlist.route'));
router.use('/shipping', require('./shipping.route'));
router.use('/payments', require('./payment.route'));
router.use('/notifications', require('./notification.route'));
router.use('/push', require('./push.route'));
router.use('/admin/users', adminUserRoute);
router.use('/admin/promotions', adminPromotionRoute);
router.use('/admin/coupons', adminCouponRoute);
router.use('/admin/orders', adminOrderRoute);
router.use('/admin/reviews', adminReviewRoute);
router.use('/admin/inventory', adminInventoryRoute);
router.use('/admin/dashboard', adminDashboardRoute);

module.exports = router;

