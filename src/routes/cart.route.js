const express = require('express');
const cartController = require('../controllers/cart.controller');
const { verifyTokenOptional } = require('../middlewares/auth.middleware');
const { cartValidations } = require('../validations');

const router = express.Router();

// Get cart (with session for guest, user for logged in)
router.get('/', verifyTokenOptional, cartController.getCart);

// Add item to cart
router.post('/items', verifyTokenOptional, cartValidations.addItem, cartController.addItem);

// Update item quantity
router.patch('/items/:variantId', verifyTokenOptional, cartValidations.updateQuantity, cartController.updateItem);

// Remove item from cart
router.delete('/items/:variantId', verifyTokenOptional, cartValidations.variantId, cartController.removeItem);

// Apply coupon
router.post('/coupon', verifyTokenOptional, cartValidations.applyCoupon, cartController.applyCoupon);

// Remove coupon
router.delete('/coupon', verifyTokenOptional, cartController.removeCoupon);

// Clear cart
router.delete('/', verifyTokenOptional, cartController.clearCart);

module.exports = router;