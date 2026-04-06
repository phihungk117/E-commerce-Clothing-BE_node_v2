const wishlistService = require('../services/wishlist.service');

class WishlistController {
  async addToWishlist(req, res, next) {
    try {
      const { product_id } = req.body;
      const user_id = req.user.user_id;

      const wishlist = await wishlistService.addToWishlist(user_id, product_id);

      res.status(201).json({
        message: 'Added to wishlist',
        wishlist
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFromWishlist(req, res, next) {
    try {
      const { productId } = req.params;
      const user_id = req.user.user_id;

      const result = await wishlistService.removeFromWishlist(user_id, productId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserWishlist(req, res, next) {
    try {
      const user_id = req.user.user_id;
      const { page = 1, limit = 20 } = req.query;

      const result = await wishlistService.getUserWishlist(user_id, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async checkInWishlist(req, res, next) {
    try {
      const { productId } = req.params;
      const user_id = req.user.user_id;

      const result = await wishlistService.checkInWishlist(user_id, productId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WishlistController();