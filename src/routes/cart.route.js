const express = require('express');
const { Cart } = require('../models');
const cartService = require('../services/cart.service');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

const mapCart = (cart) => {
  const plain = cart?.toJSON ? cart.toJSON() : cart;
  const items = (plain?.items || []).map((item) => ({
    variant_id: item.variant_id,
    quantity: item.quantity,
    variant: item.variant,
  }));

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item?.variant?.price || 0);
    return sum + price * Number(item.quantity || 0);
  }, 0);

  let discount = 0;
  if (plain?.coupon) {
    if (plain.coupon.discount_type === 'PERCENTAGE') {
      discount = subtotal * (Number(plain.coupon.discount_value || 0) / 100);
    } else {
      discount = Number(plain.coupon.discount_value || 0);
    }
    if (discount > subtotal) discount = subtotal;
  }

  return {
    cart_id: plain.cart_id,
    items,
    coupon: plain.coupon || null,
    subtotal,
    discount,
    total: subtotal - discount,
  };
};

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const cart = await cartService.getOrCreateCart(req.user.user_id);
    const hydrated = await cartService.getCartWithItems(cart.cart_id);
    return res.status(200).json({ data: mapCart(hydrated) });
  } catch (error) {
    return next(error);
  }
});

router.post('/items', verifyToken, async (req, res, next) => {
  try {
    const { variant_id, quantity = 1 } = req.body || {};
    if (!variant_id) {
      return res.status(400).json({ message: 'variant_id is required' });
    }

    const cart = await cartService.getOrCreateCart(req.user.user_id);
    const updated = await cartService.addItem(cart.cart_id, variant_id, Number(quantity));
    return res.status(200).json({ data: mapCart(updated) });
  } catch (error) {
    return next(error);
  }
});

router.patch('/items/:variantId', verifyToken, async (req, res, next) => {
  try {
    const { quantity } = req.body || {};
    const quantityNum = Number(quantity);

    if (!Number.isFinite(quantityNum)) {
      return res.status(400).json({ message: 'quantity is required' });
    }

    const cart = await cartService.getOrCreateCart(req.user.user_id);
    const updated = await cartService.updateItemQuantity(cart.cart_id, req.params.variantId, quantityNum);
    return res.status(200).json({ data: mapCart(updated) });
  } catch (error) {
    return next(error);
  }
});

router.delete('/items/:variantId', verifyToken, async (req, res, next) => {
  try {
    const cart = await cartService.getOrCreateCart(req.user.user_id);
    const updated = await cartService.removeItem(cart.cart_id, req.params.variantId);
    return res.status(200).json({ data: mapCart(updated) });
  } catch (error) {
    return next(error);
  }
});

router.post('/coupon', verifyToken, async (req, res, next) => {
  try {
    const couponCode = req.body?.coupon_code;
    if (!couponCode) {
      return res.status(400).json({ message: 'coupon_code is required' });
    }

    const cart = await cartService.getOrCreateCart(req.user.user_id);
    const updated = await cartService.applyCoupon(cart.cart_id, couponCode);
    return res.status(200).json({ data: mapCart(updated) });
  } catch (error) {
    return next(error);
  }
});

router.delete('/coupon', verifyToken, async (req, res, next) => {
  try {
    const cart = await cartService.getOrCreateCart(req.user.user_id);
    const updated = await cartService.removeCoupon(cart.cart_id);
    return res.status(200).json({ data: mapCart(updated) });
  } catch (error) {
    return next(error);
  }
});

router.delete('/', verifyToken, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: req.user.user_id } });
    if (!cart) {
      return res.status(200).json({ message: 'Cart cleared' });
    }

    await cartService.clearCart(cart.cart_id);
    return res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
