const express = require('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const reviewController = require('../controllers/review.controller');

// Need mergeParams: true because this router might be mounted at /products/:productId/reviews
const router = express.Router({ mergeParams: true });

// Public - All can read APPROVED reviews
router.get('/', reviewController.getByProduct);

// Protected - User
router.use(verifyToken);
router.post('/', reviewController.create);

// The endpoints below do not need productId in URL, usually mounted directly at /reviews/:reviewId
// However, if we mount this at /products/:productId/reviews, they will have productId.
// To decouple, we can just export a separate router or handle it in index.js
// Assuming mounted at /reviews for edit/delete
router.put('/:reviewId', reviewController.update);
router.delete('/:reviewId', reviewController.delete);

module.exports = router;
