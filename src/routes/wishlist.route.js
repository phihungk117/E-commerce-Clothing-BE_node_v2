const express = require('express');
const { Wishlist, Product } = require('../models');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const list = await Wishlist.findAll({
      where: { user_id: req.user.user_id },
      include: [{ model: Product, as: 'product' }],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({ data: list });
  } catch (error) {
    return next(error);
  }
});

router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { product_id } = req.body || {};
    if (!product_id) {
      return res.status(400).json({ message: 'product_id is required' });
    }

    const [item] = await Wishlist.findOrCreate({
      where: { user_id: req.user.user_id, product_id },
      defaults: { user_id: req.user.user_id, product_id },
    });

    return res.status(201).json({ data: item });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:productId', verifyToken, async (req, res, next) => {
  try {
    await Wishlist.destroy({
      where: {
        user_id: req.user.user_id,
        product_id: req.params.productId,
      },
    });

    return res.status(200).json({ message: 'Removed from wishlist' });
  } catch (error) {
    return next(error);
  }
});

router.get('/check/:productId', verifyToken, async (req, res, next) => {
  try {
    const item = await Wishlist.findOne({
      where: {
        user_id: req.user.user_id,
        product_id: req.params.productId,
      },
    });

    return res.status(200).json({ data: { inWishlist: !!item } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
