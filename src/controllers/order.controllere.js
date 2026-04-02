const orderService = require('../services/order.service');
const cartService = require('../services/cart.service');

class OrderController {
  async createOrder(req, res, next) {
    try {
      const user_id = req.user.user_id;
      const orderData = req.body;

      const order = await orderService.createOrder(user_id, orderData);

      res.status(201).json({
        message: 'Order created successfully',
        order
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const user_id = req.user.user_id;
      const { page = 1, limit = 10, status } = req.query;

      const result = await orderService.getUserOrders(user_id, {
        page: parseInt(page),
        limit: parseInt(limit),
        status
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyOrderDetail(req, res, next) {
    try {
      const { orderId } = req.params;
      const user_id = req.user.user_id;

      const order = await orderService.getOrderById(orderId, user_id);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json({ order });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      const user_id = req.user.user_id;

      const order = await orderService.cancelOrder(orderId, user_id);

      res.status(200).json({
        message: 'Order cancelled successfully',
        order
      });
    } catch (error) {
      next(error);
    }
  }

  async requestReturn(req, res, next) {
    try {
      const { orderId } = req.params;
      const user_id = req.user.user_id;
      const { reason } = req.body;

      const order = await orderService.requestReturn(orderId, user_id, reason);
      res.status(200).json({ message: 'Return requested', order });
    } catch (error) {
      next(error);
    }
  }

  // Admin methods
  async getAllOrders(req, res, next) {
    try {
      const { page = 1, limit = 20, status, startDate, endDate } = req.query;

      const result = await orderService.getAllOrders({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        startDate,
        endDate
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getOrderDetail(req, res, next) {
    try {
      const { orderId } = req.params;

      const order = await orderService.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json({ order });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const order = await orderService.updateOrderStatus(orderId, status);

      res.status(200).json({
        message: 'Order status updated',
        order
      });
    } catch (error) {
      next(error);
    }
  }

  async processReturn(req, res, next) {
    try {
      const { orderId } = req.params;
      const { approve = true, reason = null } = req.body;
      const actorId = req.user?.user_id || null;

      const order = await orderService.processReturn(orderId, { approve, reason, actorId });
      res.status(200).json({ message: 'Return processed', order });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();