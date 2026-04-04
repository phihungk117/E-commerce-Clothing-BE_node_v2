const addressService = require('../services/address.service');

const getAddresses = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const addresses = await addressService.getAddresses(userId);

        res.status(200).json({
            success: true,
            data: addresses
        });
    } catch (error) {
        next(error);
    }
};

const createAddress = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const address = await addressService.createAddress(userId, req.body);

        res.status(201).json({
            success: true,
            message: 'Address created successfully',
            data: address
        });
    } catch (error) {
        next(error);
    }
};

const updateAddress = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const addressId = req.params.id; // Corrected: addressId from params
        const address = await addressService.updateAddress(userId, addressId, req.body);

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: address
        });
    } catch (error) {
        next(error);
    }
};

const deleteAddress = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const addressId = req.params.id; // Corrected: addressId from params
        const result = await addressService.deleteAddress(userId, addressId);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress
};
