const reviewService = require('../services/review.service');
const { validationResult } = require('express-validator');

class ReviewController {
  async createReview(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { product_id, rating, title, content, images } = req.body;
      const user_id = req.user.user_id;

      const review = await reviewService.createReview({
        product_id,
        user_id,
        rating,
        title,
        content,
        images
      });

      res.status(201).json({
        message: 'Review created successfully',
        review
      });
    } catch (error) {
      next(error);
    }
  }

  async getReviewsByProduct(req, res, next) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10, status } = req.query;

      const result = await reviewService.getReviewsByProduct(productId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserReview(req, res, next) {
    try {
      const { productId } = req.params;
      const user_id = req.user.user_id;

      const review = await reviewService.getUserReview(user_id, productId);

      res.status(200).json({ review });
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const user_id = req.user.user_id;
      const { rating, title, content, images } = req.body;

      const review = await reviewService.updateReview(reviewId, user_id, {
        rating,
        title,
        content,
        images
      });

      res.status(200).json({
        message: 'Review updated successfully',
        review
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const user_id = req.user.user_id;

      const result = await reviewService.deleteReview(reviewId, user_id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Admin methods
  async getAllReviews(req, res, next) {
    try {
      const { page = 1, limit = 20, status } = req.query;

      const result = await reviewService.getAllReviews({
        page: parseInt(page),
        limit: parseInt(limit),
        status
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateReviewStatus(req, res, next) {
    try {
      const { reviewId } = req.params;
      const { status } = req.body;

      const review = await reviewService.updateReviewStatus(reviewId, status);

      res.status(200).json({
        message: 'Review status updated successfully',
        review
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();