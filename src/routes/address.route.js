const express = require('express');
const addressController = require('../controllers/address.controller');
const { verifyToken } = require('../middlewares/auth.middleware');


const router = express.Router();

router.get('/', verifyToken, addressController.getAddresses);
router.post('/', verifyToken, addressController.createAddress);
router.put('/:id', verifyToken, addressController.updateAddress);
router.delete('/:id', verifyToken, addressController.deleteAddress);

module.exports = router;
