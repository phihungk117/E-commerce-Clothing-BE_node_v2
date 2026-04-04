const express = require('express');
const { body, param } = require('express-validator');
const inventoryController = require('../../controllers/inventory.controller');
const { verifyToken, authorize } = require('../../middlewares/auth.middleware');
const { validate } = require('../../validations');

const router = express.Router();

router.get('/', verifyToken, authorize('ADMIN', 'STAFF'), inventoryController.getInventory);
router.get('/movements', verifyToken, authorize('ADMIN', 'STAFF'), inventoryController.getMovements);
router.patch('/:inventoryId/adjust', verifyToken, authorize('ADMIN', 'STAFF'), [
  param('inventoryId').isUUID(4),
  body('delta').isInt({ min: -999999, max: 999999 }),
  body('delta').custom((value) => Number(value) !== 0),
  body('note').optional().isString().isLength({ max: 500 }),
  validate
], inventoryController.adjustInventory);

module.exports = router;
