"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Association_info extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Association, {
        foreignKey: "association_id",
      });
    }
    toJSON() {
      return {
        ...this.get(),
        id: undefined,
      };
    }
  }
  Association_info.init(
    {
      association_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.STRING, allowNull: false },
      image: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: false },
      address: { type: DataTypes.STRING, allowNull: false },
      city: { type: DataTypes.STRING, allowNull: false },
      post_code: { type: DataTypes.INTEGER, allowNull: false },
      isComplete: { type: DataTypes.BOOLEAN, defaultValue: false },
      website: { type: DataTypes.STRING },
      facebook: { type: DataTypes.STRING },
      instagram: { type: DataTypes.STRING },
      twitter: { type: DataTypes.STRING },
    },
    {
      sequelize,
      modelName: "Association_info",
    }
  );
  return Association_info;
};
