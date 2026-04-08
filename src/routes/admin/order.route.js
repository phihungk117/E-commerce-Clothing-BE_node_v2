const express = require('express');
const { body } = require('express-validator');
const orderController = require('../../controllers/order.controller');
const { verifyToken, authorize } = require('../../middlewares/auth.middleware');
const { validate } = require('../../validations');

const router = express.Router();

// Admin routes
router.get('/', verifyToken, authorize('ADMIN', 'STAFF'), orderController.getAllOrders);
router.get('/:orderId', verifyToken, authorize('ADMIN', 'STAFF'), orderController.getOrderDetail);
router.patch('/:orderId/status', verifyToken, authorize('ADMIN', 'STAFF'), [
  body('status').isIn(['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED']),
  validate
], orderController.updateOrderStatus);

router.patch('/:orderId/return', verifyToken, authorize('ADMIN', 'STAFF'), [
  body('approve').optional().isBoolean(),
  body('reason').optional().isString().isLength({ max: 500 }),
  validate
], orderController.processReturn);

module.exports = router;
