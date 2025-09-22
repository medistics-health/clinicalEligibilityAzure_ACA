const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/db");
const provider = require('../model/provider.model');


const Patient = sequelize.define('patient', {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        provider_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: provider,
            key: "id",
          },
        },
        firstname: {
          type: DataTypes.STRING,
        },
        lastname: {
          type: DataTypes.STRING,
        },
        middlename: {
          type: DataTypes.STRING,
        },
        dateofbirth: {
          type: DataTypes.DATEONLY, // Use DATEONLY for date without time
        },
        gender: {
          type: DataTypes.CHAR(1),
        },
        ssn: {
          type: DataTypes.STRING,
        },
        mbi: {
          type: DataTypes.STRING,
        },
        address: {
          type: DataTypes.JSONB,
        },
        fhirstructure:{
          type: DataTypes.JSONB,
        },
        claimmdresponse:{
          type: DataTypes.JSONB,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
  {
  timestamps: false // Disable timestamps
});
 
module.exports = Patient;
