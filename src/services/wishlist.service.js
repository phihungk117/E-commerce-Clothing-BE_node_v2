const { Wishlist, Product, User } = require('../models');
const { Op } = require('sequelize');

class WishlistService {
  async addToWishlist(userId, productId) {
    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      where: { user_id: userId, product_id: productId }
    });
    
    if (existing) {
      throw new Error('Product already in wishlist');
    }
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    const wishlist = await Wishlist.create({
      user_id: userId,
      product_id: productId
    });
    
    return wishlist;
  }

  async removeFromWishlist(userId, productId) {
    const deleted = await Wishlist.destroy({
      where: { user_id: userId, product_id: productId }
    });
    
    if (!deleted) {
      throw new Error('Product not found in wishlist');
    }
    
    return { message: 'Removed from wishlist' };
  }

  async getUserWishlist(userId, { page = 1, limit = 20 }) {
    const { count, rows } = await Wishlist.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            { model: ProductImage, as: 'images' },
            { model: ProductVariant, as: 'variants' }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });
    
    return {
      wishlists: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  }

  async checkInWishlist(userId, productId) {
    const item = await Wishlist.findOne({
      where: { user_id: userId, product_id: productId }
    });
    
    return { isInWishlist: !!item };
  }
}

module.exports = new WishlistService();module.exports = new WishlistService();