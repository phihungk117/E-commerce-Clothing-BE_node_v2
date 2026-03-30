'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Carts', 'coupon_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Coupons',
        key: 'coupon_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('Carts', ['coupon_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Carts', 'Carts_coupon_id_idx');
    await queryInterface.removeColumn('Carts', 'coupon_id');
  }
};