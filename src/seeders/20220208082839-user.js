"use strict";
const bcrypt = require("bcrypt");
const password = bcrypt.hashSync("abc@A123", 8);

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("users", [
      {
        name: "admin",
        email: "admin@mail.com",
        password: password,
        phone_number: "1234567890",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("users", null, {});
  },
};
