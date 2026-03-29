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
// ==================== Review Validation ====================
const reviewValidations = {
  createReview: [
    body('product_id')
      .isUUID(4)
      .withMessage('Valid product ID is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('title')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Title must not exceed 255 characters'),
    body('content')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Content must not exceed 2000 characters'),
    body('images')
      .optional()
      .isArray({ max: 5 })
      .withMessage('Maximum 5 images allowed'),
    validate
  ],
  
  updateReview: [
    param('reviewId')
      .isUUID(4)
      .withMessage('Valid review ID is required'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('title')
      .optional()
      .trim()
      .isLength({ max: 255 }),
    body('content')
      .optional()
      .trim()
      .isLength({ max: 2000 }),
    validate
  ],
  
  reviewId: [
    param('reviewId')
      .isUUID(4)
      .withMessage('Valid review ID is required'),
    validate
  ]
};

// ==================== Wishlist Validation ====================
const wishlistValidations = {
  add: [
    body('product_id')
      .isUUID(4)
      .withMessage('Valid product ID is required'),
    validate
  ],
  
  productId: [
    param('productId')
      .isUUID(4)
      .withMessage('Valid product ID is required'),
    validate
  ]
};

// ==================== Payment Validation ====================
const paymentValidations = {
  createUrl: [
    body('orderId')
      .isUUID(4)
      .withMessage('Valid order ID is required'),
    body('paymentMethod')
      .isIn(['VNPAY', 'MOMO', 'ZALOPAY', 'CREDIT_CARD', 'STRIPE'])
      .withMessage('Invalid payment method'),
    body('callback_url')
      .optional()
      .isURL({ require_tld: true })
      .withMessage('Valid callback URL is required'),
    validate
  ],
  
  calculateShipping: [
    body('methodId')
      .isUUID(4)
      .withMessage('Valid shipping method ID is required'),
    body('zoneId')
      .isUUID(4)
      .withMessage('Valid shipping zone ID is required'),
    validate
  ]
};
// ==================== Notification Validation ====================
const notificationValidations = {
  broadcast: [
    body('title')
      .notEmpty()
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Title must be 3-255 characters'),
    body('content')
      .notEmpty()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Content must be 10-2000 characters'),
    body('type')
      .optional()
      .isIn(['ORDER', 'PROMOTION', 'SYSTEM', 'REVIEW'])
      .withMessage('Invalid notification type'),
    body('user_ids')
      .optional()
      .isArray()
      .withMessage('User IDs must be an array'),
    validate
  ]
};


module.exports = {
  validate,
  cartValidations,
  orderValidations,
  reviewValidations,
  wishlistValidations,
  paymentValidations,
  notificationValidations
};