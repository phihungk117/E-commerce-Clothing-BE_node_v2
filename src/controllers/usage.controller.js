const usageService = require('../services/usage.service');

const getUsages = async (req, res, next) => {
    try {
        const result = await usageService.getUsages();
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getUsageById = async (req, res, next) => {
    try {
        const result = await usageService.getUsageById(req.params.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createUsage = async (req, res, next) => {
    try {
        const result = await usageService.createUsage(req.body);
        res.status(201).json({
            success: true,
            message: 'Usage created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateUsage = async (req, res, next) => {
    try {
        const result = await usageService.updateUsage(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Usage updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteUsage = async (req, res, next) => {
    try {
        const result = await usageService.deleteUsage(req.params.id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsages,
    getUsageById,
    createUsage,
    updateUsage,
    deleteUsage
};
