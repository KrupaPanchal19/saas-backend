'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('delivery_payment_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      delivery_id: {
        type: Sequelize.INTEGER
      },
      payment_type: {
        type: Sequelize.STRING
      },
      payment_status: {
        type: Sequelize.STRING
      },
      transaction_id: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      amount: {
        type: Sequelize.STRING
      },
      note: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('delivery_payment_logs');
  }
};