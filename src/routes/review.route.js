const express = require('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const { Review } = require('../models');

const router = express.Router();

router.get('/product/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);

    const { count, rows } = await Review.findAndCountAll({
      where: { product_id: productId, status: 'APPROVED' },
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return res.status(200).json({
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { product_id, rating, title, content, images } = req.body || {};

    const review = await Review.create({
      user_id: req.user.user_id,
      product_id,
      rating,
      title,
      content,
      images: images || null,
      status: 'PENDING',
      is_verified: false,
    });

    return res.status(201).json({ data: review });
  } catch (error) {
    return next(error);
  }
});

router.get('/my-review/:productId', verifyToken, async (req, res, next) => {
  try {
    const review = await Review.findOne({
      where: {
        user_id: req.user.user_id,
        product_id: req.params.productId,
      },
    });

    return res.status(200).json({ data: review || null });
  } catch (error) {
    return next(error);
  }
});

router.put('/:reviewId', verifyToken, async (req, res, next) => {
  try {
    const review = await Review.findOne({
      where: {
        review_id: req.params.reviewId,
        user_id: req.user.user_id,
      },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const { rating, title, content, images } = req.body || {};
    await review.update({
      rating: rating ?? review.rating,
      title: title ?? review.title,
      content: content ?? review.content,
      images: images ?? review.images,
      status: 'PENDING',
    });

    return res.status(200).json({ data: review });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:reviewId', verifyToken, async (req, res, next) => {
  try {
    const deleted = await Review.destroy({
      where: {
        review_id: req.params.reviewId,
        user_id: req.user.user_id,
      },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Review not found' });
    }

    return res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
