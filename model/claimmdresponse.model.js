// models/patient.js
const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");



const claimmdresponse = sequelize.define('claimmdresponse', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  request: {
    type: DataTypes.JSONB,
  },
  response: {
    type: DataTypes.JSONB,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
},
  {
    timestamps: false // Disable timestamps
  });

module.exports = claimmdresponse;
