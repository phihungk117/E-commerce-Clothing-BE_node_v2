const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const config = require('../config/config');

cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret
});

const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ecommerce_avatars',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

const productImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ecommerce_products',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1600, height: 1600, crop: 'limit' }]
    }
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadProductImage = multer({ storage: productImageStorage });

module.exports = {
    uploadAvatar,
    uploadProductImage
};
