"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      item_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      company_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      item_image: {
        type: Sequelize.STRING,
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      flat_rate: {
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
    await queryInterface.dropTable("items");
  },
};
