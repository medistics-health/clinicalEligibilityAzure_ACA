const { Pool } = require('pg');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create the first connection pool
const pool = new Pool({
    user: process.env.DATABASE_USERNAME,
    host: process.env.DATABASE_HOST,
    database: 'ClaimMd',
    password: process.env.DATABASE_PASSWORD,//'12345',
    port: process.env.DATABASE_PORT,
});

const sequelize = new Sequelize("ClaimMd", process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT, 
  dialect: 'postgres',
  pool: {
    max: 25, // Maximum number of connections in pool
    min: 2, // Minimum number of connections in pool
    acquire: 30000, // Maximum time, in milliseconds, to wait for a connection
    idle: 10000 // Maximum time, in milliseconds, that a connection can be idle before being released
  },
});

  async function connectDB() {
    try {
      const dbConnectionResponse = await sequelize.authenticate();
      console.log('Connection has been established successfully.');
      return dbConnectionResponse;
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      return error;
      }
    }



    module.exports =  { sequelize, pool, connectDB } ;
