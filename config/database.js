import { Sequelize } from "sequelize";

const {
  DATABASE_URL, PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT
} = process.env;

const sequelize = DATABASE_URL
  ? new Sequelize(DATABASE_URL, { dialect: "postgres", protocol: "postgres", logging: false })
  : new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
      host: PGHOST || "localhost",
      port: PGPORT || 5432,
      dialect: "postgres",
      logging: false
    });

export default sequelize;
