const express = require('express');
const { param } = require('express-validator');
const notificationController = require('../controllers/notification.controller');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const { notificationValidations, validate } = require('../validations');

const router = express.Router();

// User routes (protected)
router.get('/', verifyToken, notificationController.getNotifications);
router.get('/unread-count', verifyToken, notificationController.getUnreadCount);
router.patch('/read-all', verifyToken, notificationController.markAllAsRead);

// Notification ID validations
const notificationIdValidation = [
  param('notificationId').isUUID(4).withMessage('Valid notification ID is required'),
  validate
];

router.patch('/:notificationId/read', verifyToken, notificationIdValidation, notificationController.markAsRead);
router.delete('/:notificationId', verifyToken, notificationIdValidation, notificationController.deleteNotification);

// Admin: broadcast notification
router.post('/broadcast', verifyToken, authorize('ADMIN'), notificationValidations.broadcast, notificationController.broadcastNotification);

module.exports = router;