const dashboardService = require('../services/dashboard.service');

class DashboardController {
  async getOverview(req, res, next) {
    try {
      const { start_date, end_date } = req.query;

      const result = await dashboardService.getOverview(start_date, end_date);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getRevenueChart(req, res, next) {
    try {
      const { days = 30 } = req.query;

      const result = await dashboardService.getRevenueChart(parseInt(days));

      res.status(200).json({ chart: result });
    } catch (error) {
      next(error);
    }
  }

  async getTopProducts(req, res, next) {
    try {
      const { limit = 10 } = req.query;

      const result = await dashboardService.getTopProducts(parseInt(limit));

      res.status(200).json({ topProducts: result });
    } catch (error) {
      next(error);
    }
  }

  async getTopCategories(req, res, next) {
    try {
      const { limit = 5 } = req.query;

      const result = await dashboardService.getTopCategories(parseInt(limit));

      res.status(200).json({ topCategories: result });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerStats(req, res, next) {
    try {
      const result = await dashboardService.getCustomerStats();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getReviewsStats(req, res, next) {
    try {
      const result = await dashboardService.getReviewsStats();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();