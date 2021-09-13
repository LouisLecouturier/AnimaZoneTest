"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class association extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "user_id" });
      this.hasOne(models.Owner, {
        foreignKey: "association_id",
      });
      this.hasOne(models.Association_info, {
        foreignKey: "association_id",
      });
      this.hasMany(models.Listing, {
        foreignKey: "association_id",
      });
    }

    toJSON() {
      return {
        ...this.get(),
        user_id: undefined,
      };
    }
  }
  association.init(
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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
    },
    {
      sequelize,
      tableName: "associations",
      modelName: "Association",
    }
  );
  return association;
};
