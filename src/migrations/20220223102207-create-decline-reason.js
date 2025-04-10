'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('decline_reasons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      delivery_id: {
        type: Sequelize.INTEGER
      },
      decline_reason: {
        type: Sequelize.STRING
      },
      show_client: {
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
    await queryInterface.dropTable('decline_reasons');
  }
};