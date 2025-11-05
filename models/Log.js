import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Log = sequelize.define("Log", {
  userId: { type: DataTypes.INTEGER, allowNull: true },
  method: { type: DataTypes.STRING, allowNull: false },
  route: { type: DataTypes.STRING, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: true },
  payload: { type: DataTypes.JSONB }
});

export default Log;
