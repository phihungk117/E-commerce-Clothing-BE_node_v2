const express = require('express');
const dashboardController = require('../../controllers/dashboard.controller');
const { verifyToken, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// All dashboard routes require ADMIN or STAFF role
router.get('/overview', verifyToken, authorize('ADMIN', 'STAFF'), dashboardController.getOverview);
router.get('/revenue-chart', verifyToken, authorize('ADMIN', 'STAFF'), dashboardController.getRevenueChart);
router.get('/top-products', verifyToken, authorize('ADMIN', 'STAFF'), dashboardController.getTopProducts);
router.get('/top-categories', verifyToken, authorize('ADMIN', 'STAFF'), dashboardController.getTopCategories);
router.get('/customer-stats', verifyToken, authorize('ADMIN', 'STAFF'), dashboardController.getCustomerStats);
router.get('/reviews-stats', verifyToken, authorize('ADMIN', 'STAFF'), dashboardController.getReviewsStats);

module.exports = router;
