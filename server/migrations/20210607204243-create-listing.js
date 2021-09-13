"use strict";
module.exports = {
  up: async (queryInterface, DataType) => {
    await queryInterface.createTable("Listings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataType.INTEGER,
      },

      association_id: {
        type: DataType.INTEGER,
        allowNull: false,
      },

      name: {
        type: DataType.STRING,
        allowNull: false,
      },
      gender: {
        type: DataType.STRING,
        defaultValue: "male",
      },

      price: {
        type: DataType.FLOAT(10, 2),
        defaultValue: 0,
      },

      category: {
        type: DataType.STRING,
        allowNull: false,
      },
      birth_date: {
        type: DataType.DATE,
        allowNull: false,
      },
      city: {
        type: DataType.STRING,
        allowNull: false,
      },
      image1: {
        type: DataType.STRING,
        allowNull: false,
      },
      image2: {
        type: DataType.STRING,
        allowNull: false,
      },
      image3: {
        type: DataType.STRING,
        allowNull: false,
      },
      description: {
        type: DataType.STRING,
        allowNull: false,
      },
      about1: {
        type: DataType.STRING,
        allowNull: false,
      },
      about2: {
        type: DataType.STRING,
        allowNull: false,
      },
      about3: {
        type: DataType.STRING,
        allowNull: false,
      },
      sterilized: {
        type: DataType.BOOLEAN,
        allowNull: false,
      },
      identified: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      dewormed: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },

      rage_vaccinated: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },

      // Chats
      typhus_vaccinated: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      coryza_vaccinated: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      felv_vaccinated: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      felv_test: {
        type: DataType.STRING,
      },
      fiv_test: {
        type: DataType.STRING,
      },

      // Lapin
      myxomatosis_vaccinated: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },

      rh_vaccinated: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      // Chiens
      square_disease_vaccinated: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      parvovirosis_vaccinated: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      hepatitis_vaccinated: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      leptospirosis_vaccinated: {
        type: DataType.BOOLEAN,
        defaultValue: false,
      },
      views: { type: DataType.INTEGER, defaultValue: 0 },
      likes: { type: DataType.INTEGER, defaultValue: 0 },
      createdAt: {
        allowNull: false,
        type: DataType.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataType.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Listings");
  },
};
