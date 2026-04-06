const express = require('express');
const notificationService = require('../services/notification.service');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    const result = await notificationService.getUserNotifications(req.user.user_id, {
      page,
      limit,
    });

    return res.status(200).json({ data: result.notifications, meta: result });
  } catch (error) {
    return next(error);
  }
});

router.get('/unread-count', verifyToken, async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.user_id);
    return res.status(200).json({ data: { unread: count } });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:notificationId/read', verifyToken, async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.notificationId, req.user.user_id);
    return res.status(200).json({ data: notification });
  } catch (error) {
    return next(error);
  }
});

router.patch('/read-all', verifyToken, async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.user_id);
    return res.status(200).json({ data: result });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:notificationId', verifyToken, async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(req.params.notificationId, req.user.user_id);
    return res.status(200).json({ data: result });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
