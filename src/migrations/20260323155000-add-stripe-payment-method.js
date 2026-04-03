'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Payments', 'payment_method', {
      type: Sequelize.ENUM('COD', 'VNPAY', 'MOMO', 'ZALOPAY', 'CREDIT_CARD', 'STRIPE'),
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Payments', 'payment_method', {
      type: Sequelize.ENUM('COD', 'VNPAY', 'MOMO', 'ZALOPAY', 'CREDIT_CARD'),
      allowNull: false
    });
  }
};
