"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("day_block_times", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      company_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      day: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      from_time: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      to_time: {
        allowNull: false,
        type: Sequelize.STRING,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("day_block_times");
  },
};
