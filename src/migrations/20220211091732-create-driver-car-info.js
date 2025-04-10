"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("driver_car_infos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      company_user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      car_model: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      car_type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      car_color: {
        allowNull: false,
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
    await queryInterface.dropTable("driver_car_infos");
  },
};
