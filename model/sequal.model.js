// // models/provider.js
// module.exports = (sequelize, DataTypes) => {
//     const Provider = sequelize.define('Provider', {
//       organizationName: DataTypes.STRING,
//       firstName: DataTypes.STRING,
//       lastName: DataTypes.STRING,
//       npi: DataTypes.STRING,
//       taxId: DataTypes.STRING
//     });
//     return Provider;
//   };
  
//   // models/patient.js
//   module.exports = (sequelize, DataTypes) => {
//     const Patient = sequelize.define('Patient', {
//       firstname: DataTypes.STRING,
//       lastname: DataTypes.STRING,
//       dateOfBirth: DataTypes.STRING,
//       gender: DataTypes.STRING,
//       ssn: DataTypes.STRING,
//       mbi: DataTypes.STRING,
//       address: DataTypes.JSONB // Assuming JSONB for address field
//     });
//     return Patient;
//   };
  
  // Define other models similarly for payer, encounter, medication, condition, careProgramEligible
  