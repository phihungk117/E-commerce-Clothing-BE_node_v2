const express = require('express');
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { cartValidations } = require('../validations');

const router = express.Router();

// Get cart (with session for guest, user for logged in)
router.get('/', cartController.getCart);

// Add item to cart
router.post('/items', cartValidations.addItem, cartController.addItem);

// Update item quantity
router.patch('/items/:variantId', cartValidations.updateQuantity, cartController.updateItem);

// Remove item from cart
router.delete('/items/:variantId', cartValidations.variantId, cartController.removeItem);

// Apply coupon
router.post('/coupon', cartValidations.applyCoupon, cartController.applyCoupon);

// Remove coupon
router.delete('/coupon', cartController.removeCoupon);

// Clear cart
router.delete('/', cartController.clearCart);

module.exports = router;