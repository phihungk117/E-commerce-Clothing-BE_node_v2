const express = require('express');
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.get('/profile', verifyToken, userController.getProfile);
router.patch('/profile', verifyToken, userController.updateProfile);
router.post('/avatar', verifyToken, upload.single('avatar'), userController.uploadAvatar);
router.post('/send-verification-otp', verifyToken, userController.sendVerificationOtp);
router.post('/verify-email', verifyToken, userController.verifyEmail);

module.exports = router;
