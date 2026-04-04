const express = require('express');
const router = express.Router();
const adminUserController = require('../../controllers/admin/user.controller');
const { verifyToken, authorize } = require('../../middlewares/auth.middleware');

router.get('/', verifyToken, authorize('ADMIN'), adminUserController.getAllUsers);
router.get('/:id', verifyToken, authorize('ADMIN'), adminUserController.getUserById);
router.put('/:id', verifyToken, authorize('ADMIN'), adminUserController.updateUser);

module.exports = router;
