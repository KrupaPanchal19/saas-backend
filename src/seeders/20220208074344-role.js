"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("roles", [
      {
        name: "admin",
        company_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "customer",
        company_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "driver",
        company_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("roles", null, {});
  },
};
