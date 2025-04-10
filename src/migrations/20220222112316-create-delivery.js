"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("deliveries", {
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
      pickup_location: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      destination_location: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      pikup_point: {
        allowNull: false,
        type: Sequelize.GEOMETRY,
      },
      destination_point: {
        allowNull: false,
        type: Sequelize.GEOMETRY,
      },
      expected_delivery_time: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      item_description: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      driver_notes: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      item_packaged: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      destination_type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      destination_stair_info: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      destination_elvetor_info: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      destination_coi_info: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      driver_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      createdBy: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      store_name: {
        type: Sequelize.STRING,
      },
      live_location: {
        type: Sequelize.GEOMETRY,
      },
      room_id: {
        type: Sequelize.STRING,
      },
      total_price: {
        type: Sequelize.FLOAT,
      },
      item_heavy: {
        type: Sequelize.STRING,
      },
      total_info: {
        type: Sequelize.JSON,
      },
      pickup_type: {
        type: Sequelize.STRING,
      },
      expected_drop_off_delivery_time: {
        type: Sequelize.DATE,
      },
      value_of_item: {
        type: Sequelize.STRING,
      },
      assembly: {
        type: Sequelize.BOOLEAN,
      },
      payment_type: {
        type: Sequelize.STRING,
      },
      pickup_contact: {
        type: Sequelize.STRING,
      },
      dropoff_contact: {
        type: Sequelize.STRING,
      },
      pickup_contact_phone_number: {
        type: Sequelize.STRING,
      },
      dropoff_contact_phone_number: {
        type: Sequelize.STRING,
      },
      discount: {
        type: Sequelize.FLOAT,
      },
      discount_type: {
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
    await queryInterface.dropTable("deliveries");
  },
};
