import { Sequelize } from "sequelize";
import { envDBConfig } from "../configs/config.env";

const sequelize = new Sequelize({
  host: envDBConfig.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  database: envDBConfig.DB_NAME,
  username: envDBConfig.DB_USERNAME,
  password: envDBConfig.DB_PASSWORD,
  dialect: "mysql", // or 'mariadb' if using MariaDB
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  dialectOptions: {
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log("Successfully connected to the database.");
    // Sync models in development
    if (process.env.NODE_ENV === "development") {
      // Sync models with the database (optional, but recommended)
      const DB_Sync: boolean = Boolean(envDBConfig.DB_SYNC);
      // Set force: true to drop and recreate tables
      await sequelize.sync({ alter: true, force: DB_Sync });
      console.log("All models were synchronized successfully.");
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

export default sequelize;
