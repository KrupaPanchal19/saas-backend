"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("prices", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      company_id: {
        type: Sequelize.INTEGER,
      },
      key: {
        type: Sequelize.STRING,
      },
      value: {
        type: Sequelize.STRING,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("prices");
  },
};
