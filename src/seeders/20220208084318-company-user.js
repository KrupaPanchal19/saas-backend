"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("company_users", [
      {
        user_id: 1,
        company_id: 1,
        role_id: 1,
        status: "ACTIVE",
        id_number: "a15483",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("company_users", null, {});
  },
};
