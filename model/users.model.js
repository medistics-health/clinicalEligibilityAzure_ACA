const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");


const users = sequelize.define('users', {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        firstname: {
          type: DataTypes.STRING,
        },
        lastName: {
          type: DataTypes.STRING,
        },
        middlename: {
          type: DataTypes.STRING,
        },
        username: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
  {
  timestamps: false // Disable timestamps
});
 
module.exports = users;
