const { sequelize } = require("../config/db");

// Import all models
const models = {
  Provider: require('../model/provider.model'),
  Patient: require('../model/patient.model'),
  payer: require('../model/payer.model'),
  Medication: require('../model/medication.model'),
  Encounter: require('../model/encounter.model'),
  Condition: require('../model/condition.model'),
  CareProgramEligible: require('../model/careprogrameligible.model'),
  ClaimMDResponse: require('../model/claimmdresponse.model'),
  users: require('../model/users.model')
};


async function syncModels() {
  try {
    // Loop through all models and synchronize each one
    for (const modelName in models) {
      if (Object.hasOwnProperty.call(models, modelName)) {
        console.log(`inside model Syncmodel`,modelName);
        const Model = models[modelName]; // Get the model class
        console.log("----->",Model);
       let sync =  await Model.sync(); // Call sync on the model class directly
       console.log("----->",sync)
        console.log(`${modelName} synchronized with database.`);
      }
    }
    console.log('All models synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing models with database:', error);
  }
}

module.exports = syncModels;
