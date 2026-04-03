const jwt = require('jsonwebtoken');
const config = require('../config/config');

const verifyToken = (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: 'Không tìm thấy token truy cập.' });
        }
        
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trimLeft();
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded; // payload from auth.service includes user_id, role
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
        next();
    } else {
        return res.status(403).json({ message: 'Bạn không có quyền truy cập.' });
    }
};

module.exports = {
    verifyToken,
    isAdmin
};
