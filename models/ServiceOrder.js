import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Vehicle from "./Vehicle.js";

const ServiceOrder = sequelize.define("ServiceOrder", {
  description: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM("aberta","em_andamento","concluida"), defaultValue: "aberta" },
  cost: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 }
});

Vehicle.hasMany(ServiceOrder, { onDelete: "CASCADE" });
ServiceOrder.belongsTo(Vehicle);

export default ServiceOrder;
