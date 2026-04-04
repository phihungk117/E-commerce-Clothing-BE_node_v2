const { Address } = require('../models');
const { Op } = require('sequelize');

const getAddresses = async (userId) => {
    const addresses = await Address.findAll({
        where: { user_id: userId },
        order: [
            ['is_default', 'DESC'], // Default address first
            ['created_at', 'DESC']
        ]
    });
    return addresses;
};

const createAddress = async (userId, data) => {
    // If new address is set as default, unset previous default
    if (data.is_default) {
        await Address.update(
            { is_default: false },
            {
                where: {
                    user_id: userId,
                    is_default: true
                }
            }
        );
    }

    // Check if this is the first address, make it default automatically if not specified
    if (data.is_default === undefined) {
        const count = await Address.count({ where: { user_id: userId } });
        if (count === 0) {
            data.is_default = true;
        }
    }

    const address = await Address.create({
        ...data,
        user_id: userId
    });
    return address;
};

const updateAddress = async (userId, addressId, data) => {
    const address = await Address.findOne({
        where: { address_id: addressId, user_id: userId }
    });

    if (!address) {
        const error = new Error('Address not found');
        error.status = 404;
        throw error;
    }

    // If setting as default, unset others // Correct logic: If setting this one to default, others become non-default
    if (data.is_default) {
        await Address.update(
            { is_default: false },
            {
                where: {
                    user_id: userId,
                    address_id: { [Op.ne]: addressId }
                }
            }
        );
    }

    await address.update(data);
    return address;
};

const deleteAddress = async (userId, addressId) => {
    const address = await Address.findOne({
        where: { address_id: addressId, user_id: userId }
    });

    if (!address) {
        const error = new Error('Address not found');
        error.status = 404;
        throw error;
    }

    await address.destroy();
    return { message: 'Address deleted successfully' };
};

module.exports = {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress
};
