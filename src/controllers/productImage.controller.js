const productImageService = require('../services/productImage.service');

const getImagesByProduct = async (req, res, next) => {
    try {
        const result = await productImageService.getImagesByProduct(req.params.productId);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getImageById = async (req, res, next) => {
    try {
        const result = await productImageService.getImageById(req.params.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createImage = async (req, res, next) => {
    try {
        const result = await productImageService.createImage(req.params.productId, req.body);
        res.status(201).json({
            success: true,
            message: 'Product image created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateImage = async (req, res, next) => {
    try {
        const result = await productImageService.updateImage(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Product image updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteImage = async (req, res, next) => {
    try {
        const result = await productImageService.deleteImage(req.params.id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const setThumbnail = async (req, res, next) => {
    try {
        const result = await productImageService.setThumbnail(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Thumbnail set successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const reorderImages = async (req, res, next) => {
    try {
        const result = await productImageService.reorderImages(req.params.productId, req.body.orders);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getImagesByProduct,
    getImageById,
    createImage,
    updateImage,
    deleteImage,
    setThumbnail,
    reorderImages
};
