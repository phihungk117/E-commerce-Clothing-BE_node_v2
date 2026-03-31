const couponService = require('../services/coupon.service');

const validateCoupon = async (req, res, next) => {
    try {
        const { code, order_value } = req.body;
        const userId = req.user ? req.user.user_id : null;
        const result = await couponService.validateCoupon(code, order_value, userId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const applyCoupon = async (req, res, next) => {
    try {
        const { code, order_id, order_value } = req.body;
        const result = await couponService.applyCoupon(code, order_id, req.user.user_id, order_value);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getAllCoupons = async (req, res, next) => {
    try {
        const result = await couponService.getAllCoupons(req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getCouponById = async (req, res, next) => {
    try {
        const result = await couponService.getCouponById(req.params.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createCoupon = async (req, res, next) => {
    try {
        const result = await couponService.createCoupon(req.body);
        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateCoupon = async (req, res, next) => {
    try {
        const result = await couponService.updateCoupon(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Coupon updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteCoupon = async (req, res, next) => {
    try {
        const result = await couponService.deleteCoupon(req.params.id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const getCouponUsages = async (req, res, next) => {
    try {
        const result = await couponService.getCouponUsages(req.params.id, req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    validateCoupon,
    applyCoupon,
    getAllCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getCouponUsages
};
