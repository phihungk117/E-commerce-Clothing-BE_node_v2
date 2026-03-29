const colorService = require('../services/color.service');

const getColors = async (req, res, next) => {
    try {
        const result = await colorService.getColors();
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getColorById = async (req, res, next) => {
    try {
        const result = await colorService.getColorById(req.params.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createColor = async (req, res, next) => {
    try {
        const result = await colorService.createColor(req.body);
        res.status(201).json({
            success: true,
            message: 'Color created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateColor = async (req, res, next) => {
    try {
        const result = await colorService.updateColor(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Color updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteColor = async (req, res, next) => {
    try {
        const result = await colorService.deleteColor(req.params.id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getColors,
    getColorById,
    createColor,
    updateColor,
    deleteColor
};
