import { Sequelize } from "sequelize";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está definida no ambiente");
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

export default sequelize;
