const { Notification, User } = require('../models');
const { Op } = require('sequelize');
const emailService = require('./email.service');
const pushService = require('./push.service');

class NotificationService {
  async createNotification(userId, data) {
    const { title, content, type, reference_type, reference_id } = data;
    
    const notification = await Notification.create({
      user_id: userId,
      title,
      content,
      type,
      reference_type,
      reference_id,
      is_read: false
    });

    // Send email notification for important types
    if (['ORDER', 'PROMOTION', 'SYSTEM'].includes(type)) {
      const user = await User.findByPk(userId);
      if (user && user.email) {
        try {
          await emailService.sendNotificationEmail(user, notification);
        } catch (error) {
          console.error('Failed to send email notification:', error);
        }
      }
    }

    try {
      await pushService.sendToUser(userId, {
        title,
        body: content,
        type,
        reference_type,
        reference_id
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }

    return notification;
  }

  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    const where = { user_id: userId };
    if (unreadOnly) where.is_read = false;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit
    });

    return {
      notifications: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      unreadCount: await this.getUnreadCount(userId)
    };
  }

  async getUnreadCount(userId) {
    return Notification.count({
      where: { user_id: userId, is_read: false }
    });
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { notification_id: notificationId, user_id: userId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.update({ is_read: true });
    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );

    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { notification_id: notificationId, user_id: userId }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.destroy();
    return { message: 'Notification deleted' };
  }

  // Send order notifications
  async sendOrderNotification(order, status) {
    const userId = order.user_id;
    
    const notifications = {
      CONFIRMED: { title: 'Order Confirmed', content: `Your order ${order.order_code} has been confirmed.` },
      SHIPPING: { title: 'Order Shipped', content: `Your order ${order.order_code} has been shipped.` },
      DELIVERED: { title: 'Order Delivered', content: `Your order ${order.order_code} has been delivered.` },
      CANCELLED: { title: 'Order Cancelled', content: `Your order ${order.order_code} has been cancelled.` }
    };

    const notifData = notifications[status];
    if (notifData) {
      await this.createNotification(userId, {
        ...notifData,
        type: 'ORDER',
        reference_type: 'ORDER',
        reference_id: order.order_id
      });
    }
  }

  // Send promotion notifications
  async sendPromotionNotification(userIds, promotion) {
    for (const userId of userIds) {
      await this.createNotification(userId, {
        title: 'New Promotion!',
        content: promotion.description || `Check out our new promotion: ${promotion.name}`,
        type: 'PROMOTION',
        reference_type: 'PROMOTION',
        reference_id: promotion.promotion_id
      });
    }
  }

  // Admin: Send broadcast notification
  async broadcastNotification(adminId, data) {
    const { user_ids, title, content, type = 'SYSTEM' } = data;

    if (user_ids && user_ids.length > 0) {
      // Send to specific users
      for (const userId of user_ids) {
        await this.createNotification(userId, { title, content, type });
      }
    } else {
      // Send to all users
      const users = await User.findAll({ attributes: ['user_id'] });
      for (const user of users) {
        await this.createNotification(user.user_id, { title, content, type });
      }
    }

    return { message: 'Notification broadcast sent' };
  }
}

module.exports = new NotificationService();