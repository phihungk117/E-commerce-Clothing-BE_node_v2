const express = require('express');
const wishlistController = require('../controllers/wishlist.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { wishlistValidations } = require('../validations');

const router = express.Router();

// Protected routes (require authentication)
router.get('/', verifyToken, wishlistController.getUserWishlist);
router.post('/', verifyToken, wishlistValidations.add, wishlistController.addToWishlist);
router.delete('/:productId', verifyToken, wishlistValidations.productId, wishlistController.removeFromWishlist);
router.get('/check/:productId', verifyToken, wishlistValidations.productId, wishlistController.checkInWishlist);

module.exports = router;