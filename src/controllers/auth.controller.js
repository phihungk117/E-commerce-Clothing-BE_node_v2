const authService = require('../services/auth.service');

const register = async (req, res, next) => {
    try {
        const user = await authService.registerUser(req.body);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const error = new Error('Email and password are required');
            error.status = 400;
            throw error;
        }

        const result = await authService.loginUser({ email, password });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { old_password, new_password } = req.body;
        const userId = req.user.user_id; // Added by auth middleware

        if (!old_password || !new_password) {
            const error = new Error('Old password and new password are required');
            error.status = 400;
            throw error;
        }

        const result = await authService.changePassword(userId, old_password, new_password);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            const error = new Error('Email is required');
            error.status = 400;
            throw error;
        }

        const result = await authService.forgotPassword(email);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token, new_password } = req.body; // Token can be in body or query, let's assume body
        // Or cleaner: token from query, password from body. But JSON body is standard.
        // Let's actually support query param too if we want, but sticking to body is consistent.
        // Wait, typical flow is clicking link -> Frontend Page (gets token from URL) -> Frontend sends POST API with token in body.

        if (!token || !new_password) {
            const error = new Error('Token and new password are required');
            error.status = 400;
            throw error;
        }

        const result = await authService.resetPassword(token, new_password);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const loginWithGoogle = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) {
            const error = new Error('Token is required');
            error.status = 400;
            throw error;
        }

        const data = await authService.loginWithGoogle(token);
        res.json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    changePassword,
    forgotPassword,
    resetPassword,
    loginWithGoogle
};
