const express = require('express');
const { body } = require('express-validator');
const pushController = require('../controllers/push.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { validate } = require('../validations');

const router = express.Router();

router.post('/register', verifyToken, [
  body('token').notEmpty().isString(),
  body('platform').optional().isIn(['WEB', 'ANDROID', 'IOS']),
  validate
], pushController.registerToken);

router.post('/unregister', verifyToken, [
  body('token').notEmpty().isString(),
  validate
], pushController.unregisterToken);

module.exports = router;
