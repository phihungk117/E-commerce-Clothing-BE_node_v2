const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../../controllers/review.controller');
const { verifyToken, authorize } = require('../../middlewares/auth.middleware');
const { validate } = require('../../validations');

const router = express.Router();

router.get('/', verifyToken, authorize('ADMIN', 'STAFF'), reviewController.getAllReviews);
router.patch('/:reviewId/status', verifyToken, authorize('ADMIN', 'STAFF'), [
  body('status').isIn(['PENDING', 'APPROVED', 'REJECTED']),
  validate
], reviewController.updateReviewStatus);

module.exports = router;
