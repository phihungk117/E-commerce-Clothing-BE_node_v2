const cartService = require('../services/cart.service');
const { v4: uuidv4 } = require('uuid');

async function buildCartResponse(userId, cart) {
  const response = { cart: await cartService.serializeCartForApi(cart) };
  if (!userId && cart?.session_id) {
    response.session_id = cart.session_id;
  }
  return response;
}

class CartController {
  async getCart(req, res, next) {
    try {
      const userId = req.user?.user_id;
      const sessionId = req.headers['x-session-id'] || req.cookies?.session_id;
      
      const cart = await cartService.getOrCreateCart(userId, sessionId);
      
      res.status(200).json(await buildCartResponse(userId, cart));
    } catch (error) {
      next(error);
    }
  }

  async addItem(req, res, next) {
    try {
      const userId = req.user?.user_id;
      const sessionId = req.headers['x-session-id'] || req.cookies?.session_id;
      const { variant_id, quantity = 1 } = req.body;
      
      const cart = await cartService.getOrCreateCart(userId, sessionId);
      const updatedCart = await cartService.addItem(cart.cart_id, variant_id, quantity);
      
      res.status(200).json(await buildCartResponse(userId, updatedCart));
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req, res, next) {
    try {
      const userId = req.user?.user_id;
      const sessionId = req.headers['x-session-id'] || req.cookies?.session_id;
      const { variantId } = req.params;
      const { quantity } = req.body;
      
      const cart = await cartService.getOrCreateCart(userId, sessionId);
      const updatedCart = await cartService.updateItemQuantity(cart.cart_id, variantId, quantity);
      
      res.status(200).json(await buildCartResponse(userId, updatedCart));
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req, res, next) {
    try {
      const userId = req.user?.user_id;
      const sessionId = req.headers['x-session-id'] || req.cookies?.session_id;
      const { variantId } = req.params;
      
      const cart = await cartService.getOrCreateCart(userId, sessionId);
      const updatedCart = await cartService.removeItem(cart.cart_id, variantId);
      
      res.status(200).json(await buildCartResponse(userId, updatedCart));
    } catch (error) {
      next(error);
    }
  }

  async applyCoupon(req, res, next) {
    try {
      const userId = req.user?.user_id;
      const sessionId = req.headers['x-session-id'] || req.cookies?.session_id;
      const { code } = req.body;
      
      const cart = await cartService.getOrCreateCart(userId, sessionId);
      const updatedCart = await cartService.applyCoupon(cart.cart_id, code);
      
      res.status(200).json(await buildCartResponse(userId, updatedCart));
    } catch (error) {
      next(error);
    }
  }

  async removeCoupon(req, res, next) {
    try {
      const userId = req.user?.user_id;
      const sessionId = req.headers['x-session-id'] || req.cookies?.session_id;
      
      const cart = await cartService.getOrCreateCart(userId, sessionId);
      const updatedCart = await cartService.removeCoupon(cart.cart_id);
      
      res.status(200).json(await buildCartResponse(userId, updatedCart));
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      const userId = req.user?.user_id;
      const sessionId = req.headers['x-session-id'] || req.cookies?.session_id;
      
      const cart = await cartService.getOrCreateCart(userId, sessionId);
      const updatedCart = await cartService.clearCart(cart.cart_id);
      
      res.status(200).json(await buildCartResponse(userId, updatedCart));
    } catch (error) {
      next(error);
    }
  }

  async mergeCart(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { guest_session_id } = req.body;
      
      const mergedCart = await cartService.mergeCarts(guest_session_id, userId);
      
      res.status(200).json({ cart: await cartService.serializeCartForApi(mergedCart) });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
