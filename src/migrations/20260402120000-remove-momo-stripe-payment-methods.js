'use strict';

/** Reassign legacy MoMo / Stripe / credit-card rows before shrinking ENUM (MySQL). */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE Payments
      SET payment_method = 'VNPAY'
      WHERE payment_method IN ('MOMO', 'STRIPE', 'CREDIT_CARD')
    `);

    await queryInterface.changeColumn('Payments', 'payment_method', {
      type: Sequelize.ENUM('COD', 'VNPAY', 'ZALOPAY'),
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Payments', 'payment_method', {
      type: Sequelize.ENUM('COD', 'VNPAY', 'MOMO', 'ZALOPAY', 'CREDIT_CARD', 'STRIPE'),
      allowNull: false
    });
  }
};
