"use strict";
module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("association_infos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      association_id: { allowNull: false, type: DataTypes.INTEGER },
      name: { allowNull: false, type: DataTypes.STRING },
      description: {
        type: DataTypes.STRING,
      },
      image: { allowNull: false, type: DataTypes.STRING },
      email: {
        type: DataTypes.STRING,
      },
      phone: { allowNull: false, type: DataTypes.STRING },
      address: { allowNull: false, type: DataTypes.STRING },
      city: { allowNull: false, type: DataTypes.STRING },
      post_code: { allowNull: false, type: DataTypes.INTEGER },
      isComplete: { type: DataTypes.BOOLEAN, defaultValue: false },
      website: { type: DataTypes.STRING },
      facebook: { type: DataTypes.STRING },
      instagram: { type: DataTypes.STRING },
      twitter: { type: DataTypes.STRING },
      createdAt: { allowNull: false, type: DataTypes.DATE },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("association_infos");
  },
};
