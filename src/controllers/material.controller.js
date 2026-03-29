const materialService = require('../services/material.service');

const getMaterials = async (req, res, next) => {
    try {
        const result = await materialService.getMaterials();
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getMaterialById = async (req, res, next) => {
    try {
        const result = await materialService.getMaterialById(req.params.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const createMaterial = async (req, res, next) => {
    try {
        const result = await materialService.createMaterial(req.body);
        res.status(201).json({
            success: true,
            message: 'Material created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateMaterial = async (req, res, next) => {
    try {
        const result = await materialService.updateMaterial(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Material updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteMaterial = async (req, res, next) => {
    try {
        const result = await materialService.deleteMaterial(req.params.id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMaterials,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial
};
