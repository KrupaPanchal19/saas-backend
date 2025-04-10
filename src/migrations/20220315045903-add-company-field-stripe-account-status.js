"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn("companies", "stripe_account_status", {
        allowNull: false,
        type: Sequelize.STRING,
        default: "Restricted",
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("companies", "stripe_account_status");
  },
};
