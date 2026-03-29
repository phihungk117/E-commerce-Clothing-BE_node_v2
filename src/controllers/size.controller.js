const sizeService = require('../services/size.service');

const getSizes = async (req, res, next) => {
    try {
        const result = await sizeService.getSizes(req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getSizeById = async (req, res, next) => {
    try {
        const result = await sizeService.getSizeById(req.params.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createSize = async (req, res, next) => {
    try {
        const result = await sizeService.createSize(req.body);
        res.status(201).json({
            success: true,
            message: 'Size created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateSize = async (req, res, next) => {
    try {
        const result = await sizeService.updateSize(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Size updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteSize = async (req, res, next) => {
    try {
        const result = await sizeService.deleteSize(req.params.id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSizes,
    getSizeById,
    createSize,
    updateSize,
    deleteSize
};
