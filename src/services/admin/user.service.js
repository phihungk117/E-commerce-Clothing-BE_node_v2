const { User } = require('../../models');
const { Op } = require('sequelize');

const getAllUsers = async (params) => {
    const { page = 1, limit = 10, search, role, status } = params;
    const offset = (page - 1) * limit;

    const where = {};

    where.role = { [Op.ne]: 'ADMIN' };

    if (search) {
        where[Op.or] = [
            { email: { [Op.like]: `%${search}%` } },
            { first_name: { [Op.like]: `%${search}%` } },
            { last_name: { [Op.like]: `%${search}%` } },
            { phone_number: { [Op.like]: `%${search}%` } }
        ];
    }

    if (role) {
        where.role = role;
    }

    if (status) {
        where.status = status;
    }

    const { count, rows } = await User.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        attributes: { exclude: ['password_hash', 'deleted_at', 'reset_password_token', 'reset_password_expires', 'email_verification_token', 'email_verification_expires'] }
    });

    return {
        totalItems: count,
        users: rows,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
    };
};

const getUserById = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash', 'deleted_at', 'reset_password_token', 'reset_password_expires', 'email_verification_token', 'email_verification_expires'] },
        include: [
            {
                association: 'addresses',
                attributes: ['address_id', 'recipient_name', 'phone_number', 'street_address', 'ward', 'district', 'city', 'is_default']
            }
        ]
    });

    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    return user;
};

const updateUser = async (userId, data) => {
    const user = await User.findByPk(userId);

    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    const { role, status } = data;

    // Only allow updating role and status
    if (role) {
        // Optional: Add validation for allowed roles if needed
        const allowedRoles = ['CUSTOMER', 'ADMIN', 'STAFF'];
        if (!allowedRoles.includes(role)) {
            const error = new Error('Invalid role');
            error.status = 400;
            throw error;
        }
        user.role = role;
    }

    if (status) {
        const allowedStatus = ['ACTIVE', 'BANNED', 'PENDING'];
        if (!allowedStatus.includes(status)) {
            const error = new Error('Invalid status');
            error.status = 400;
            throw error;
        }
        user.status = status;
    }

    await user.save();

    const userResponse = user.toJSON();
    delete userResponse.password_hash;
    delete userResponse.deleted_at;
    delete userResponse.reset_password_token;
    delete userResponse.reset_password_expires;

    return userResponse;
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser
};
