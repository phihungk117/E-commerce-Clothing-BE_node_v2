class PushService {
  async sendToUser(_userId, _payload) {
    return { ok: true };
  }
}

module.exports = new PushService();
