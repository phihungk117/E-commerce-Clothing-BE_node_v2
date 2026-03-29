const { body, param, query, validationResult } = require('express-validator');

// Helper to check validation errors (Giữ lại hàm này vì các file khác có thể cần)
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};
// ==================== Cart Validation ====================
const cartValidations = {
  addItem: [
    body('variant_id')
      .isUUID(4)
      .withMessage('Valid variant ID is required'),
    body('quantity')
      .optional()
      .isInt({ min: 1, max: 999 })
      .withMessage('Quantity must be between 1 and 999'),
    validate
  ],
  
  updateQuantity: [
    param('variantId')
      .isUUID(4)
      .withMessage('Valid variant ID is required'),
    body('quantity')
      .isInt({ min: 0, max: 999 })
      .withMessage('Quantity must be between 0 and 999'),
    validate
  ],

  variantId: [
    param('variantId')
      .isUUID(4)
      .withMessage('Valid variant ID is required'),
    validate
  ],
  
  applyCoupon: [
    body('code')
      .notEmpty()
      .trim()
      .isLength({ min: 4, max: 50 })
      .withMessage('Coupon code must be 4-50 characters'),
    validate
  ]
};
// ==================== Order Validation ====================
const orderValidations = {
  createOrder: [
    body('customer_name')
      .notEmpty()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Customer name must be 2-100 characters'),
    body('customer_phone')
      .notEmpty()
      .trim()
      .matches(/^[0-9]{10,11}$/)
      .withMessage('Valid phone number is required (10-11 digits)'),
    body('shipping_address')
      .notEmpty()
      .trim()
      .isLength({ min: 10, max: 500 })
      .withMessage('Shipping address must be 10-500 characters'),
    body('payment_method')
      .isIn(['COD', 'VNPAY', 'MOMO', 'ZALOPAY', 'CREDIT_CARD', 'STRIPE'])
      .withMessage('Invalid payment method'),
    body('note')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Note must not exceed 1000 characters'),
    validate
  ],
  
  orderId: [
    param('orderId')
      .isUUID(4)
      .withMessage('Valid order ID is required'),
    validate
  ]
};


module.exports = {
  validate
};