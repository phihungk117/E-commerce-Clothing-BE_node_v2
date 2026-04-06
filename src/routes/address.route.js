const express = require('express');
const { Op } = require('sequelize');
const { Address } = require('../models');
const { verifyToken } = require('../middlewares/auth.middleware');

const router = express.Router();

const mapAddressToResponse = (address) => ({
  address_id: address.address_id,
  recipient_name: address.recipient_name,
  phone: address.phone_number,
  address: address.street_address,
  ward: address.ward,
  district: address.district,
  city: address.city,
  is_default: address.is_default,
  created_at: address.created_at,
  updated_at: address.updated_at,
});

router.get('/', verifyToken, async (req, res, next) => {
  try {
    const addresses = await Address.findAll({
      where: { user_id: req.user.user_id },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']],
    });

    return res.status(200).json({ data: addresses.map(mapAddressToResponse) });
  } catch (error) {
    return next(error);
  }
});

router.post('/', verifyToken, async (req, res, next) => {
  try {
    const payload = req.body || {};

    const created = await Address.create({
      user_id: req.user.user_id,
      recipient_name: payload.recipient_name,
      phone_number: payload.phone,
      street_address: payload.address,
      ward: payload.ward,
      district: payload.district,
      city: payload.city,
      is_default: !!payload.is_default,
    });

    if (created.is_default) {
      await Address.update(
        { is_default: false },
        {
          where: {
            user_id: req.user.user_id,
            address_id: { [Op.ne]: created.address_id },
          },
        }
      );
    }

    return res.status(201).json({ data: mapAddressToResponse(created) });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', verifyToken, async (req, res, next) => {
  try {
    const address = await Address.findOne({
      where: { address_id: req.params.id, user_id: req.user.user_id },
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const payload = req.body || {};
    await address.update({
      recipient_name: payload.recipient_name ?? address.recipient_name,
      phone_number: payload.phone ?? address.phone_number,
      street_address: payload.address ?? address.street_address,
      ward: payload.ward ?? address.ward,
      district: payload.district ?? address.district,
      city: payload.city ?? address.city,
      is_default: payload.is_default ?? address.is_default,
    });

    if (address.is_default) {
      await Address.update(
        { is_default: false },
        {
          where: {
            user_id: req.user.user_id,
            address_id: { [Op.ne]: address.address_id },
          },
        }
      );
    }

    return res.status(200).json({ data: mapAddressToResponse(address) });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const deleted = await Address.destroy({
      where: { address_id: req.params.id, user_id: req.user.user_id },
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Address not found' });
    }

    return res.status(200).json({ message: 'Address deleted' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
