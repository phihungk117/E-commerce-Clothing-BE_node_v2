const { Order, OrderItem, Product, Category, User, ProductVariant, Review, Payment, Inventory, sequelize } = require('../models');
const { Op } = require('sequelize');

class DashboardService {
  async getOverview(startDate = null, endDate = null) {
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);

    // Total revenue
    const revenueResult = await Payment.findOne({
      where: { 
        payment_status: 'SUCCESS',
        ...(startDate || endDate ? { created_at: dateFilter } : {})
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.col('payment_id')), 'totalTransactions']
      ],
      raw: true
    });

    // Orders count by status
    const ordersByStatus = await Order.findAll({
      where: startDate || endDate ? { created_at: dateFilter } : {},
      attributes: [
        'order_status',
        [sequelize.fn('COUNT', sequelize.col('order_id')), 'count']
      ],
      group: ['order_status'],
      raw: true
    });

    // Total customers
    const totalCustomers = await User.count({ where: { role: 'USER' } });

    // Total products
    const totalProducts = await Product.count({ where: { is_active: true } });

    // Low stock products
    const lowStockProducts = await Inventory.findAll({
      where: sequelize.where(sequelize.col('on_hand'), {
        [Op.lte]: sequelize.col('reserved')
      }),
      include: [{ 
        model: ProductVariant, 
        as: 'variant', 
        include: [{ model: Product, as: 'product' }] 
      }],
      limit: 10
    });

    // Recent orders
    const recentOrders = await Order.findAll({
      include: [
        { model: User, as: 'user', attributes: ['full_name', 'email'] },
        { model: Payment, as: 'payment' }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await Order.count({
      where: {
        created_at: { [Op.between]: [today, tomorrow] }
      }
    });

    const todayRevenue = await Payment.sum('amount', {
      where: { 
        payment_status: 'SUCCESS',
        payment_time: { [Op.between]: [today, tomorrow] }
      }
    });

    return {
      overview: {
        totalRevenue: parseFloat(revenueResult?.totalRevenue || 0),
        totalTransactions: parseInt(revenueResult?.totalTransactions || 0),
        totalCustomers,
        totalProducts,
        todayOrders,
        todayRevenue: todayRevenue || 0
      },
      ordersByStatus,
      lowStockProducts,
      recentOrders
    };
  }

  async getRevenueChart(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyRevenue = await Payment.findAll({
      where: {
        payment_status: 'SUCCESS',
        payment_time: { [Op.gte]: startDate }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('payment_time')), 'date'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'revenue'],
        [sequelize.fn('COUNT', sequelize.col('payment_id')), 'orders']
      ],
      group: [sequelize.fn('DATE', sequelize.col('payment_time'))],
      order: [[sequelize.fn('DATE', sequelize.col('payment_time')), 'ASC']],
      raw: true
    });

    return dailyRevenue;
  }

  async getTopProducts(limit = 10) {
    const topProducts = await OrderItem.findAll({
      attributes: [
        'product_name',
        'sku',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'totalRevenue']
      ],
      group: ['product_name', 'sku', 'variant_id'],
      order: [[sequelize.literal('totalSold'), 'DESC']],
      limit,
      raw: true
    });

    return topProducts;
  }

  async getTopCategories(limit = 5) {
    const topCategories = await Product.findAll({
      attributes: [
        'category_id',
        [sequelize.fn('COUNT', sequelize.col('variants->orderItems.order_item_id')), 'orderCount']
      ],
      include: [
        { model: Category, as: 'category', attributes: ['name'] },
        {
          model: ProductVariant,
          as: 'variants',
          attributes: [],
          include: [{ model: OrderItem, as: 'orderItems', attributes: [] }]
        }
      ],
      group: ['Product.category_id', 'category.category_id'],
      order: [[sequelize.literal('orderCount'), 'DESC']],
      limit,
      subQuery: false
    });

    return topCategories;
  }

  async getCustomerStats() {
    const newCustomers = await User.count({
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const activeCustomers = await Order.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('user_id'))), 'active']
      ],
      where: {
        created_at: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      raw: true
    });

    return {
      newCustomers,
      activeCustomers: parseInt(activeCustomers[0]?.active || 0)
    };
  }

  async getReviewsStats() {
    const totalReviews = await Review.count();
    const pendingReviews = await Review.count({ where: { status: 'PENDING' } });
    const avgRating = await Review.findOne({
      where: { status: 'APPROVED' },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
      raw: true
    });

    return {
      totalReviews,
      pendingReviews,
      averageRating: parseFloat(avgRating?.avgRating || 0).toFixed(1)
    };
  }
}

module.exports = new DashboardService();
