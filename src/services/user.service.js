const { User } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const emailService = require('./email.service');

const getUserProfile = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    const userResponse = user.toJSON();
    delete userResponse.password_hash;
    delete userResponse.deleted_at;
    delete userResponse.reset_password_token;
    delete userResponse.reset_password_expires;

    return userResponse;
};

const updateUserProfile = async (userId, data) => {
    const user = await User.findByPk(userId);
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    const {
        first_name,
        last_name,
        phone_number,
        gender,
        date_of_birth,
        avatar_url,
        preferences
    } = data; // Whitelist allowed fields

    // Check phone number uniqueness if changed
    if (phone_number && phone_number !== user.phone_number) {
        const existingPhone = await User.findOne({
            where: {
                phone_number,
                user_id: { [Op.ne]: userId } // Check other users
            }
        });
        if (existingPhone) {
            const error = new Error('Phone number already in use');
            error.status = 409;
            throw error;
        }
    }

    // Update fields
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (phone_number) user.phone_number = phone_number;
    if (gender) user.gender = gender;
    if (date_of_birth) user.date_of_birth = date_of_birth;
    if (avatar_url) user.avatar_url = avatar_url;
    if (preferences) user.preferences = preferences;

    await user.save();

    const userResponse = user.toJSON();
    delete userResponse.password_hash;
    delete userResponse.deleted_at;
    delete userResponse.reset_password_token;
    delete userResponse.reset_password_expires;

    return userResponse;
};

const sendVerificationOtp = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('User not found'); // Should not happen with auth middleware
    }

    if (user.is_email_verified) {
        const error = new Error('Email is already verified');
        error.status = 400;
        throw error;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save to user
    user.email_verification_token = otp;
    user.email_verification_expires = otpExpires;
    await user.save();

    // Send email
    try {
        await emailService.sendVerificationEmail(user.email, otp);
    } catch (error) {
        user.email_verification_token = null;
        user.email_verification_expires = null;
        await user.save();
        throw new Error('Failed to send verification email');
    }

    return { message: 'Verification code sent to your email' };
};

const verifyEmail = async (userId, otp) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('User not found');
    }

    if (user.is_email_verified) {
        return { message: 'Email is already verified' };
    }

    if (!user.email_verification_token || user.email_verification_token !== otp) {
        const error = new Error('Invalid verification code');
        error.status = 400;
        throw error;
    }

    if (user.email_verification_expires < Date.now()) {
        const error = new Error('Verification code has expired');
        error.status = 400;
        throw error;
    }

    // Verify user
    user.is_email_verified = true;
    user.email_verification_token = null;
    user.email_verification_expires = null;
    await user.save();

    return { message: 'Email verified successfully' };
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    sendVerificationOtp,
    verifyEmail
};
