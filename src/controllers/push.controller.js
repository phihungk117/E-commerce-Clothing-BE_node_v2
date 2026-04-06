const pushService = require('../services/push.service');

class PushController {
  async registerToken(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { token, platform = 'WEB' } = req.body;
      const result = await pushService.registerToken(userId, token, platform);
      res.status(201).json({ message: 'Push token registered', device: result });
    } catch (error) {
      next(error);
    }
  }

  async unregisterToken(req, res, next) {
    try {
      const userId = req.user.user_id;
      const { token } = req.body;
      const result = await pushService.unregisterToken(userId, token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PushController();