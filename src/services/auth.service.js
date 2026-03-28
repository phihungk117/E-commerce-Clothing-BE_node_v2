const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/config');
const crypto = require('crypto');
const emailService = require('./email.service');
const { Op } = require('sequelize');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(config.google.client_id);

const validatePassword = (password) => {
    if (password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    if (!/[a-zA-Z]/.test(password)) {
        return 'Password must contain at least one letter';
    }
    if (!/\d/.test(password)) {
        return 'Password must contain at least one number';
    }
    return null;
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Invalid email format';
    }
    return null;
};

const registerUser = async (data) => {
    const {
        email,
        password,
        first_name,
        last_name,
        phone_number,
        gender,
        date_of_birth
    } = data;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
        const error = new Error('Missing required fields: email, password, first_name, last_name');
        error.status = 400;
        throw error;
    }

    // Validate email format
    const emailError = validateEmail(email);
    if (emailError) {
        const error = new Error(emailError);
        error.status = 400;
        throw error;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
        const error = new Error(passwordError);
        error.status = 400;
        throw error;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        const error = new Error('Email already in use');
        error.status = 409; // Conflict
        throw error;
    }

    // Check phone number if provided (since it's unique in model)
    if (phone_number) {
        const existingPhone = await User.findOne({ where: { phone_number } });
        if (existingPhone) {
            const error = new Error('Phone number already in use');
            error.status = 409;
            throw error;
        }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
        email,
        password_hash,
        first_name,
        last_name,
        phone_number,
        gender,
        date_of_birth,
        role: 'CUSTOMER', // Default role for registration
        status: 'ACTIVE'
    });

    // Convert to JSON and remove sensitive data
    const userResponse = newUser.toJSON();
    delete userResponse.password_hash;
    delete userResponse.deleted_at;

    return userResponse;
};

const loginUser = async ({ email, password }) => {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
        const error = new Error('Invalid email or password');
        error.status = 401; // Unauthorized
        throw error;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        const error = new Error('Invalid email or password');
        error.status = 401; // Unauthorized
        throw error;
    }

    // Check if user is active
    if (user.status === 'BANNED') {
        const error = new Error('Your account has been suspended. Please contact support.');
        error.status = 403; // Forbidden
        throw error;
    }

    if (user.status !== 'ACTIVE') {
        const error = new Error('User account is not active');
        error.status = 403; // Forbidden
        throw error;
    }

    // Generate JWT Token
    const payload = {
        user_id: user.user_id,
        email: user.email,
        phone: user.phone_number || null,
        role: user.role
    };

    const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
    });

    // Update last login
    user.last_login_at = new Date();
    await user.save();

    // Prepare response
    const userResponse = user.toJSON();
    delete userResponse.password_hash;
    delete userResponse.deleted_at;

    return {
        user: userResponse,
        token
    };
};

const changePassword = async (userId, oldPassword, newPassword) => {
    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
        const error = new Error('User not found');
        error.status = 404;
        throw error;
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
        const error = new Error('Incorrect old password');
        error.status = 401;
        throw error;
    }

    // Validate new password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
        const error = new Error(passwordError);
        error.status = 400;
        throw error;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update user
    user.password_hash = password_hash;
    await user.save();

    return { message: 'Password updated successfully' };
};

const forgotPassword = async (email) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        // For security, don't reveal if email exists or not
        return { message: 'If that email address is in our system, we will send you an email to reset your password.' };
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Save to user
    user.reset_password_token = resetToken;
    user.reset_password_expires = passwordResetExpires;
    await user.save();

    // Send email
    try {
        await emailService.sendResetPasswordEmail(user.email, resetToken);
    } catch (error) {
        user.reset_password_token = null;
        user.reset_password_expires = null;
        await user.save();
        throw new Error('There was an error sending the email. Try again later!');
    }

    return { message: 'If that email address is in our system, we will send you an email to reset your password.' };
};

const resetPassword = async (token, newPassword) => {
    // Find user with token and valid expiration
    const user = await User.findOne({
        where: {
            reset_password_token: token,
            reset_password_expires: { [Op.gt]: Date.now() }
        }
    });

    if (!user) {
        const error = new Error('Password reset token is invalid or has expired');
        error.status = 400;
        throw error;
    }

    // Validate new password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
        const error = new Error(passwordError);
        error.status = 400; // Correct status code for validation error
        throw error;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update user
    user.password_hash = password_hash;
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    return { message: 'Password has been reset successfully' };
};

const loginWithGoogle = async (idToken) => {
    // Verify Google Token
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: config.google.client_id
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ where: { email } });

    if (user) {
        // User exists
        // If user was created with local auth, we might want to link or just allow login
        // Update avatar if not set
        if (!user.avatar_url) {
            user.avatar_url = picture;
        }



        // Ensure user is active
        if (user.status === 'BANNED') {
            const error = new Error('Your account has been suspended. Please contact support.');
            error.status = 403;
            throw error;
        }

        if (user.status !== 'ACTIVE') {
            const error = new Error('User account is not active');
            error.status = 403;
            throw error;
        }

        await user.save();
    } else {
        // Create new user
        // Generate a random password (since they login with Google)
        const password = crypto.randomBytes(16).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        user = await User.create({
            email,
            password_hash,
            first_name: given_name || 'User',
            last_name: family_name || '',
            avatar_url: picture,
            role: 'CUSTOMER',
            status: 'ACTIVE',
            is_email_verified: true, // Google verified email
            auth_provider: 'google',
            auth_provider_id: googleId
        });
    }

    // Generate App Token
    const jwtPayload = {
        user_id: user.user_id,
        email: user.email,
        phone: user.phone_number || null,
        role: user.role
    };

    const token = jwt.sign(jwtPayload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
    });

    // Update last login
    user.last_login_at = new Date();
    await user.save();

    const userResponse = user.toJSON();
    delete userResponse.password_hash;
    delete userResponse.deleted_at;
    delete userResponse.reset_password_token;

    return {
        user: userResponse,
        token
    };
};

module.exports = {
    registerUser,
    loginUser,
    changePassword,
    forgotPassword,
    resetPassword,
    loginWithGoogle
};