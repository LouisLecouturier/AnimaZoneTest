"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Listing extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Association, { foreignKey: "association_id" });
    }
  }
  Listing.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        defaultValue: "male",
      },

      price: {
        type: DataTypes.FLOAT(10, 2),
        defaultValue: 0,
      },

      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      birth_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image2: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image3: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      about1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      about2: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      about3: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      sterilized: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      identified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      dewormed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      rage_vaccinated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      // Chats
      typhus_vaccinated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      coryza_vaccinated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      felv_vaccinated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      felv_test: {
        type: DataTypes.STRING,
      },
      fiv_test: {
        type: DataTypes.STRING,
      },

      // Lapin
      myxomatosis_vaccinated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      rh_vaccinated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      // Chiens
      square_disease_vaccinated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      parvovirosis_vaccinated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      hepatitis_vaccinated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      leptospirosis_vaccinated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      views: { type: DataTypes.INTEGER, defaultValue: 0 },
      likes: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      sequelize,
      tableName: "listings",
      modelName: "Listing",
    }
  );
  return Listing;
};
