const express = require('express');
const reviewController = require('../controllers/review.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { reviewValidations } = require('../validations');

const router = express.Router();

// Public routes
router.get('/product/:productId', reviewController.getReviewsByProduct);

// Protected routes
router.post('/', verifyToken, reviewValidations.createReview, reviewController.createReview);
router.get('/my-review/:productId', verifyToken, reviewController.getUserReview);
router.patch('/:reviewId', verifyToken, reviewValidations.updateReview, reviewController.updateReview);
router.delete('/:reviewId', verifyToken, reviewValidations.reviewId, reviewController.deleteReview);

module.exports = router;