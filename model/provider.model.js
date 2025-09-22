// models/patient.js
const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");


const provider = sequelize.define('provider', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    data: {
      type: DataTypes.JSONB,
    },
    fhirprovider: {
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

module.exports = provider;
