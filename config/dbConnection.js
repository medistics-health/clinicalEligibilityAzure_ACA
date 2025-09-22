// Import Sequelize
const { Sequelize } = require("sequelize");
require("dotenv").config();
// Initialize Sequelize with database credentialssa
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: "postgres",
    dialectOptions: {
      connectTimeout: 30000, // 30 seconds
    },
    pool: {
      acquire: 30000, // Maximum time (ms) to wait for a connection from the pool before throwing an error
    },
  }
);

// Test the connection
async function connectMainDB() {
  try {
    const dbConnectionResponse = await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    return dbConnectionResponse;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return error;
  }
}

// Export the Sequelize instance
module.exports = { sequelize, connectMainDB };
