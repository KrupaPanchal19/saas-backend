"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("message_read_statuses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      receiver_id: {
        type: Sequelize.INTEGER,
      },
      message_id: {
        type: Sequelize.INTEGER,
      },
      room_id: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("message_read_statuses");
  },
};
