const express = require('express');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');
const adminReviewController = require('../../controllers/admin/review.controller');

const router = express.Router();

router.use(verifyToken);
router.use(isAdmin); // Require admin privileges

router.get('/', adminReviewController.getAll);
router.put('/:reviewId/status', adminReviewController.updateStatus);

module.exports = router;
