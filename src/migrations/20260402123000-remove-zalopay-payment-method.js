'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE Payments
      SET payment_method = 'VNPAY'
      WHERE payment_method = 'ZALOPAY'
    `);

    await queryInterface.changeColumn('Payments', 'payment_method', {
      type: Sequelize.ENUM('COD', 'VNPAY'),
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Payments', 'payment_method', {
      type: Sequelize.ENUM('COD', 'VNPAY', 'ZALOPAY'),
      allowNull: false
    });
  }
};
