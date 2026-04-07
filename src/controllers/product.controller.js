const productService = require('../services/product.service');

const getProducts = async (req, res, next) => {
    try {
        const result = await productService.getProducts(req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const searchProducts = async (req, res, next) => {
    try {
        const result = await productService.searchProducts(req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const result = await productService.getProductById(req.params.id, req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const result = await productService.createProduct(req.body);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const result = await productService.updateProduct(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const result = await productService.deleteProduct(req.params.id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const getFilterOptions = async (req, res, next) => {
    try {
        const result = await productService.getFilterOptions();
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    searchProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getFilterOptions
};
