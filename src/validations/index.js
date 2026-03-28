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

module.exports = {
  validate
};