// models/patient.js
const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");
const Patient = require('../model/patient.model');


const careprogrameligible = sequelize.define('careprogrameligible', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  careprogram: {
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
    defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
  },
},
  {
    timestamps: false // Disable timestamps
  });


module.exports = careprogrameligible;
