const express = require('express');

const healthRoute = require('./health.route');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const adminUserRoute = require('./admin/user.route');
const productRoute = require('./product.route');
const categoryRoute = require('./category.route');
const colorRoute = require('./color.route');
const sizeRoute = require('./size.route');
const materialRoute = require('./material.route');
const usageRoute = require('./usage.route');
const promotionRoute = require('./promotion.route');
const couponRoute = require('./coupon.route');
const addressRoute = require('./address.route');
const cartRoute = require('./cart.route');
const orderRoute = require('./order.route');
const reviewRoute = require('./review.route');
const wishlistRoute = require('./wishlist.route');
const shippingRoute = require('./shipping.route');
const paymentRoute = require('./payment.route');
const notificationRoute = require('./notification.route');

const router = express.Router();

router.use('/health', healthRoute);
router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/admin/users', adminUserRoute);

router.use('/products', productRoute);
router.use('/categories', categoryRoute);
router.use('/colors', colorRoute);
router.use('/sizes', sizeRoute);
router.use('/materials', materialRoute);
router.use('/usages', usageRoute);
router.use('/promotions', promotionRoute);
router.use('/coupons', couponRoute);

router.use('/addresses', addressRoute);
router.use('/cart', cartRoute);
router.use('/orders', orderRoute);
router.use('/reviews', reviewRoute);
router.use('/wishlist', wishlistRoute);
router.use('/shipping', shippingRoute);
router.use('/payments', paymentRoute);
router.use('/notifications', notificationRoute);

module.exports = router;
