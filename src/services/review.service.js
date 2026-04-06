const { Review, Product, User, sequelize } = require('../models');

class ReviewService {
  async createReview(data) {
    const { product_id, user_id, rating, title, content, images } = data;
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: { product_id, user_id }
    });
    
    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }
    
    const review = await Review.create({
      product_id,
      user_id,
      rating,
      title,
      content,
      images,
      status: 'PENDING'
    });
    
    return review;
  }

  async getReviewsByProduct(productId, { page = 1, limit = 10, status = 'APPROVED' }) {
    const where = { product_id: productId };
    if (status) where.status = status;
    
    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['user_id', 'full_name', 'avatar'] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });
    
    // Calculate average rating
    const avgRating = await Review.findOne({
      where: { product_id: productId, status: 'APPROVED' },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
      ],
      raw: true
    });
    
    return {
      reviews: rows,
      total: count,
      averageRating: avgRating?.avgRating || 0,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  }

  async getUserReview(userId, productId) {
    return Review.findOne({
      where: { user_id: userId, product_id: productId }
    });
  }

  async updateReview(reviewId, userId, data) {
    const review = await Review.findOne({
      where: { review_id: reviewId, user_id: userId }
    });
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    await review.update(data);
    return review;
  }

  async deleteReview(reviewId, userId) {
    const review = await Review.findOne({
      where: { review_id: reviewId, user_id: userId }
    });
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    await review.destroy();
    return { message: 'Review deleted successfully' };
  }

  // Admin methods
  async getAllReviews({ page = 1, limit = 20, status }) {
    const where = status ? { status } : {};
    
    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['product_id', 'name'] },
        { model: User, as: 'user', attributes: ['user_id', 'full_name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });
    
    return {
      reviews: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  }

  async updateReviewStatus(reviewId, status) {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
    
    await review.update({ status });
    return review;
  }
}

module.exports = new ReviewService();