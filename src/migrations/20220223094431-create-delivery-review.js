'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('delivery_reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      delivery_id: {
        type: Sequelize.INTEGER
      },
      review: {
        type: Sequelize.STRING
      },
      rate: {
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
    await queryInterface.dropTable('delivery_reviews');
  }
};