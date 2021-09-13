"use strict";
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("Associations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },

      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },

      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      object: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      post_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      siret: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      association_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Associations");
  },
};
