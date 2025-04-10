"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("service_area_restrictions", {
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      mode: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("service_area_restrictions");
  },
};
