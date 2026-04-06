const express = require('express');
const orderController = require('../controllers/order.controllere');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Customer routes
router.post('/', verifyToken, (req, res, next) => orderController.createOrder(req, res, next));
router.get('/my-orders', verifyToken, (req, res, next) => orderController.getMyOrders(req, res, next));
router.get('/my-orders/:orderId', verifyToken, (req, res, next) => orderController.getMyOrderDetail(req, res, next));
router.post('/:orderId/cancel', verifyToken, (req, res, next) => orderController.cancelOrder(req, res, next));
router.post('/:orderId/return-request', verifyToken, (req, res, next) => orderController.requestReturn(req, res, next));

// Admin/Staff routes
router.get('/', verifyToken, authorize('ADMIN', 'STAFF'), (req, res, next) => orderController.getAllOrders(req, res, next));
router.get('/:orderId', verifyToken, authorize('ADMIN', 'STAFF'), (req, res, next) => orderController.getOrderDetail(req, res, next));
router.patch('/:orderId/status', verifyToken, authorize('ADMIN', 'STAFF'), (req, res, next) => orderController.updateOrderStatus(req, res, next));
router.post('/:orderId/return-process', verifyToken, authorize('ADMIN', 'STAFF'), (req, res, next) => orderController.processReturn(req, res, next));

module.exports = router;
