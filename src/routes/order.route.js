const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { orderValidations, validate } = require('../validations');

const router = express.Router();

// User routes (protected)
router.post('/', verifyToken, orderValidations.createOrder, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getMyOrders);
router.get('/my-orders/:orderId', verifyToken, orderValidations.orderId, orderController.getMyOrderDetail);
router.post('/:orderId/cancel', verifyToken, orderValidations.orderId, orderController.cancelOrder);
router.post('/:orderId/return-request', verifyToken, [
  body('reason').optional().isString().isLength({ max: 500 }),
  validate
], orderController.requestReturn);

module.exports = router;
