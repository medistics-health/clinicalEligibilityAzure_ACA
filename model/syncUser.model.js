const { sequelize } = require("./dbConnection");

// Import all models
const models = {
  masterUser: require('../models/masterUser'),
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
