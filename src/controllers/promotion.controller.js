const promotionService = require('../services/promotion.service');

const getActivePromotions = async (req, res, next) => {
    try {
        const result = await promotionService.getActivePromotions();
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getAllPromotions = async (req, res, next) => {
    try {
        const result = await promotionService.getAllPromotions(req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getPromotionById = async (req, res, next) => {
    try {
        const result = await promotionService.getPromotionById(req.params.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createPromotion = async (req, res, next) => {
    try {
        const result = await promotionService.createPromotion(req.body);
        res.status(201).json({
            success: true,
            message: 'Promotion created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updatePromotion = async (req, res, next) => {
    try {
        const result = await promotionService.updatePromotion(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Promotion updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deletePromotion = async (req, res, next) => {
    try {
        const result = await promotionService.deletePromotion(req.params.id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const addProductsToPromotion = async (req, res, next) => {
    try {
        const { productIds } = req.body;
        const result = await promotionService.addProductsToPromotion(req.params.id, productIds);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const removeProductFromPromotion = async (req, res, next) => {
    try {
        const result = await promotionService.removeProductFromPromotion(req.params.id, req.params.productId);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const getProductPromotions = async (req, res, next) => {
    try {
        const result = await promotionService.getProductPromotions(req.params.productId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getActivePromotions,
    getAllPromotions,
    getPromotionById,
    createPromotion,
    updatePromotion,
    deletePromotion,
    addProductsToPromotion,
    removeProductFromPromotion,
    getProductPromotions
};
