// models/patient.js
const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");
const Patient = require('../model/patient.model');


const condition = sequelize.define('condition', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  data: {
    type: DataTypes.JSONB,
  },
  fhircondition: {
    type: DataTypes.JSONB,
  },
  patient_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Patient,
      key: "id",
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
},
{
timestamps: false // Disable timestamps
});

module.exports = condition;
