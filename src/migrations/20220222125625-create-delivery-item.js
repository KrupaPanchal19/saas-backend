"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("delivery_items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      item_quantity: {
        type: Sequelize.INTEGER,
      },
      image: {
        type: Sequelize.JSON,
      },
      delivery_id: {
        type: Sequelize.INTEGER,
      },
      item_id: {
        type: Sequelize.INTEGER,
      },
      description: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("delivery_items");
  },
};
