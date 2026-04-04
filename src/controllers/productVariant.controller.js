const productVariantService = require('../services/productVariant.service');

const getVariantsByProduct = async (req, res, next) => {
    try {
        const result = await productVariantService.getVariantsByProduct(req.params.productId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getVariantById = async (req, res, next) => {
    try {
        const result = await productVariantService.getVariantById(req.params.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createVariant = async (req, res, next) => {
    try {
        const result = await productVariantService.createVariant(req.params.productId, req.body);
        res.status(201).json({
            success: true,
            message: 'Product variant created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateVariant = async (req, res, next) => {
    try {
        const result = await productVariantService.updateVariant(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Product variant updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteVariant = async (req, res, next) => {
    try {
        const result = await productVariantService.deleteVariant(req.params.id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const updateStock = async (req, res, next) => {
    try {
        const { quantity, operation } = req.body;
        const result = await productVariantService.updateStock(req.params.id, quantity, operation);
        res.status(200).json({
            success: true,
            message: 'Stock updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVariantsByProduct,
    getVariantById,
    createVariant,
    updateVariant,
    deleteVariant,
    updateStock
};
