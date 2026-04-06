const express = require('express');
const { verifyToken } = require('../middlewares/auth.middleware');
const { User } = require('../models');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

router.get('/profile', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: { exclude: ['password_hash', 'deleted_at', 'reset_password_token', 'reset_password_expires', 'email_verification_token', 'email_verification_expires'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    return next(error);
  }
});

router.patch('/profile', verifyToken, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedFields = ['first_name', 'last_name', 'phone_number', 'gender', 'date_of_birth'];
    const updates = {};

    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    await user.update(updates);

    const sanitized = user.toJSON();
    delete sanitized.password_hash;
    delete sanitized.deleted_at;
    delete sanitized.reset_password_token;
    delete sanitized.reset_password_expires;
    delete sanitized.email_verification_token;
    delete sanitized.email_verification_expires;

    return res.status(200).json({ data: sanitized });
  } catch (error) {
    return next(error);
  }
});

router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const avatarUrl = req.file?.path || req.file?.secure_url || null;
    if (!avatarUrl) {
      return res.status(400).json({ message: 'Avatar file is required' });
    }

    await user.update({ avatar_url: avatarUrl });

    const sanitized = user.toJSON();
    delete sanitized.password_hash;
    delete sanitized.deleted_at;
    delete sanitized.reset_password_token;
    delete sanitized.reset_password_expires;
    delete sanitized.email_verification_token;
    delete sanitized.email_verification_expires;

    return res.status(200).json({ data: sanitized });
  } catch (error) {
    return next(error);
  }
});

router.post('/send-verification-otp', verifyToken, async (_req, res) => {
  // Placeholder endpoint for FE compatibility
  return res.status(200).json({ message: 'OTP sent' });
});

router.post('/verify-email', verifyToken, async (req, res) => {
  const { otp } = req.body || {};
  if (!otp) {
    return res.status(400).json({ message: 'OTP is required' });
  }

  // Placeholder endpoint for FE compatibility
  return res.status(200).json({ message: 'Email verified' });
});

module.exports = router;
