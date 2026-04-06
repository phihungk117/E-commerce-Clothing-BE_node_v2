const { DeviceToken } = require('../models');

class PushService {
  async registerToken(userId, token, platform = 'WEB') {
    const [record] = await DeviceToken.findOrCreate({
      where: { user_id: userId, token },
      defaults: { user_id: userId, token, platform, is_active: true }
    });

    if (!record.is_active) {
      await record.update({ is_active: true, platform });
    }

    return record;
  }

  async unregisterToken(userId, token) {
    await DeviceToken.update(
      { is_active: false },
      { where: { user_id: userId, token } }
    );
    return { message: 'Push token unregistered' };
  }

  async sendToUser(userId, payload) {
    const tokens = await DeviceToken.findAll({
      where: { user_id: userId, is_active: true },
      attributes: ['token', 'platform']
    });

    // placeholder: integrate FCM/APNS/WebPush provider here
    return {
      delivered: tokens.length,
      payload
    };
  }
}

module.exports = new PushService();