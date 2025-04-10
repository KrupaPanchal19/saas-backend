"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn("users", "payment_customer_id"),
      queryInterface.addColumn("company_users", "payment_customer_id", {
        allowNull: true,
        type: Sequelize.STRING,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn("users", "payment_customer_id", {
        type: Sequelize.STRING,
        allowNull: true,
      }),

      queryInterface.removeColumn("company_users", "payment_customer_id"),
    ]);
  },
};
