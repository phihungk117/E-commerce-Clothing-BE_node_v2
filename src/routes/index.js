const express = require('express');

// --- CÁC ROUTE GIỮ LẠI CHO NGÀY 1 ---
const healthRoute = require('./health.route');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const adminUserRoute = require('./admin/user.route');

// --- CÁC ROUTE KHÁC (ẨN ĐI ĐỂ TRÁNH LỖI CANNOT FIND MODULE) ---
// const addressRoute = require('./address.route');
// const categoryRoute = require('./category.route');
// const colorRoute = require('./color.route');
// const sizeRoute = require('./size.route');
// const materialRoute = require('./material.route');
// const usageRoute = require('./usage.route');
// const promotionRoute = require('./promotion.route');
// const couponRoute = require('./coupon.route');
// const adminPromotionRoute = require('./admin/promotion.route');
// const adminCouponRoute = require('./admin/coupon.route');
// const adminOrderRoute = require('./admin/order.route');
// const adminDashboardRoute = require('./admin/dashboard.route');
// const adminReviewRoute = require('./admin/review.route');
// const adminInventoryRoute = require('./admin/inventory.route');

const router = express.Router();

// --- KÍCH HOẠT CÁC ROUTE CỦA NGÀY 1 ---
router.use('/health', healthRoute);
router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/admin/users', adminUserRoute);

// --- ẨN CÁC ROUTE CHƯA COPY SANG ---
// router.use('/addresses', addressRoute);
// router.use('/products', require('./product.route'));
// router.use('/categories', categoryRoute);
// router.use('/colors', colorRoute);
// router.use('/sizes', sizeRoute);
// router.use('/materials', materialRoute);
// router.use('/usages', usageRoute);
// router.use('/promotions', promotionRoute);
// router.use('/coupons', couponRoute);
// router.use('/cart', require('./cart.route'));
// router.use('/orders', require('./order.route'));

// --- Kích hoạt Review Routes ---
router.use('/products/:productId/reviews', require('./review.route'));
router.use('/reviews', require('./review.route'));

// router.use('/wishlist', require('./wishlist.route'));
// router.use('/shipping', require('./shipping.route'));
// router.use('/payments', require('./payment.route'));
// router.use('/notifications', require('./notification.route'));
// router.use('/push', require('./push.route'));
// router.use('/admin/promotions', adminPromotionRoute);
// router.use('/admin/coupons', adminCouponRoute);
// router.use('/admin/orders', adminOrderRoute);

// --- Kích hoạt Admin Review Routes ---
router.use('/admin/reviews', require('./admin/review.route'));

// router.use('/admin/inventory', adminInventoryRoute);
// router.use('/admin/dashboard', adminDashboardRoute);

module.exports = router;