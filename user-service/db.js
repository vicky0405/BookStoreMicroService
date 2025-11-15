require("dotenv").config();
const { Sequelize } = require("sequelize");

// Use service-specific env vars when available, otherwise fall back to generic DB_* vars.
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT || 1433;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: process.env.DB_INSTANCE ? undefined : DB_PORT,
  dialect: "mssql",
  logging: false,
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: true,
      instanceName: process.env.DB_INSTANCE || undefined,
    },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ user-service: Connected to SQL Server successfully.");
  })
  .catch((err) => {
    console.error("❌ user-service: SQL Server connection error:", err);
  });

module.exports = sequelize;
