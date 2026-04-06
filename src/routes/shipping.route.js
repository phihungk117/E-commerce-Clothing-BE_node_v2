const express = require('express');
const shippingController = require('../controllers/shipping.controller');
const { verifyToken, authorize } = require('../middlewares/auth.middleware');
const { shippingValidations, paymentValidations } = require('../validations');

const router = express.Router();

// Public routes
router.get('/', shippingController.getShippingMethods);
router.get('/zones', shippingController.getShippingZones);
router.get('/:methodId', shippingController.getShippingMethodById);
router.post('/calculate', paymentValidations.calculateShipping, shippingController.calculateShipping);

// Admin routes - methods
router.post('/', verifyToken, authorize('ADMIN'), shippingValidations.create, shippingController.createShippingMethod);
router.patch('/:methodId', verifyToken, authorize('ADMIN'), shippingValidations.methodId, shippingController.updateShippingMethod);
router.delete('/:methodId', verifyToken, authorize('ADMIN'), shippingValidations.methodId, shippingController.deleteShippingMethod);

// Admin routes - zones
router.post('/zones', verifyToken, authorize('ADMIN'), shippingController.createShippingZone);
router.patch('/zones/:zoneId', verifyToken, authorize('ADMIN'), shippingController.updateShippingZone);
router.delete('/zones/:zoneId', verifyToken, authorize('ADMIN'), shippingController.deleteShippingZone);

// Admin routes - method-zone fee mapping
router.get('/:methodId/zones', verifyToken, authorize('ADMIN', 'STAFF'), shippingController.getMethodZones);
router.post('/:methodId/zones', verifyToken, authorize('ADMIN'), shippingController.assignZoneToMethod);

module.exports = router;
