const notificationService = require('../services/notification.service');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { page = 1, limit = 20, unread_only = 'false' } = req.query;

      const result = await notificationService.getUserNotifications(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        unreadOnly: unread_only === 'true'
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.user_id;
      const count = await notificationService.getUnreadCount(userId);

      res.status(200).json({ unreadCount: count });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.user_id;

      const notification = await notificationService.markAsRead(notificationId, userId);

      res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.user_id;
      const result = await notificationService.markAllAsRead(userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.user_id;

      const result = await notificationService.deleteNotification(notificationId, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Admin: broadcast notification
  async broadcastNotification(req, res, next) {
    try {
      const { user_ids, title, content, type } = req.body;

      const result = await notificationService.broadcastNotification(req.user.user_id, {
        user_ids,
        title,
        content,
        type
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();