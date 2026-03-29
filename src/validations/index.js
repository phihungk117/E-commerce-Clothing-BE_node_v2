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

module.exports = {
  validate
};