const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findByPk(decoded.user_id);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
};

module.exports = {
  verifyToken,
  authorize,
};
