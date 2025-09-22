// Import Sequelize
const { Sequelize, DataTypes } = require('sequelize');

// Import Sequelize instance (assuming it's initialized in database.js)
const { sequelize } = require('../config/dbConnection');

const MasterUser = sequelize.define('MasterUsers', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  npi: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  },
  taxId: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false
  }
},{
  timestamps: false // Disable timestamps
});

// Export the MasterUser model and syncModel function
module.exports = MasterUser;