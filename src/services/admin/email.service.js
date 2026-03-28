const nodemailer = require('nodemailer');
const config = require('../config/config');
const transporter = nodemailer.createTransport(config.email.smtp);

const sendResetPasswordEmail = async (to, token) => {
    const resetUrl = `${process.env.FRONT_END_URL}reset-password?token=${token}`; // Assuming Frontend is on port 3000

    const message = {
        from: config.email.from,
        to,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Please click on the following link to reset your password: ${resetUrl}\n\nIf you did not request this, please ignore this email.`,
        html: `
            <p>You requested a password reset.</p>
            <p>Please click on the following link to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>If you did not request this, please ignore this email.</p>
        `,
    };

    await transporter.sendMail(message);
};

const sendVerificationEmail = async (to, otp) => {
    const message = {
        from: config.email.from,
        to,
        subject: 'Verify Your Email',
        text: `Your email verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
        html: `
            <h3>Verify Your Email</h3>
            <p>Your email verification code is:</p>
            <h1>${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this code, please ignore this email.</p>
        `,
    };

    await transporter.sendMail(message);
};

const sendNotificationEmail = async (user, notification) => {
    const message = {
        from: config.email.from,
        to: user.email,
        subject: `[Notification] ${notification.title}`,
        text: `${notification.title}\n\n${notification.content || ''}`,
        html: `
            <h3>${notification.title}</h3>
            <p>${notification.content || ''}</p>
        `,
    };

    await transporter.sendMail(message);
};

module.exports = {
    sendResetPasswordEmail,
    sendVerificationEmail,
    sendNotificationEmail
};