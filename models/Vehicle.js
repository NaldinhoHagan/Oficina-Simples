import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Client from "./Client.js";

const Vehicle = sequelize.define("Vehicle", {
  plate: { type: DataTypes.STRING, allowNull: false },
  model: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.INTEGER }
});

Client.hasMany(Vehicle, { onDelete: "CASCADE" });
Vehicle.belongsTo(Client);

export default Vehicle;
