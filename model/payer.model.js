// models/patient.js
const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");
const Patient = require('../model/patient.model');



const payer = sequelize.define('payer', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      fhirstructure: {
        type: DataTypes.JSONB,
      },
      data: {
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

  module.exports =  payer;