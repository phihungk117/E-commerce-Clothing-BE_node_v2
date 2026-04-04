const userService = require('../services/user.service');

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const user = await userService.getUserProfile(userId);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const updatedUser = await userService.updateUserProfile(userId, req.body);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            const error = new Error('No file uploaded');
            error.status = 400;
            throw error;
        }

        const userId = req.user.user_id;
        const avatarUrl = req.file.path; // Cloudinary URL

        const updatedUser = await userService.updateUserProfile(userId, { avatar_url: avatarUrl });

        res.status(200).json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: { avatar_url: avatarUrl }
        });
    } catch (error) {
        next(error);
    }
};

const sendVerificationOtp = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        await userService.sendVerificationOtp(userId);

        res.status(200).json({
            success: true,
            message: 'Verification code sent to your email'
        });
    } catch (error) {
        next(error);
    }
};

const verifyEmail = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const { otp } = req.body;

        if (!otp) {
            const error = new Error('OTP is required');
            error.status = 400;
            throw error;
        }

        const result = await userService.verifyEmail(userId, otp);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadAvatar,
    sendVerificationOtp,
    verifyEmail
};
