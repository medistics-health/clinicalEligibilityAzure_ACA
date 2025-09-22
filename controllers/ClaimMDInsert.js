const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { createResource } = require('fhir-kit-client');
const { pool } = require('../config/db'); // Import the database connection
const router = express.Router();
const { fetchDataFromDatabase, makePostRequest } = require('.././services/claimMD');
const { verifyToken } = require('../config/token');
const Provider = require('../model/sequal.model').Provider;
const Patient = require('../model/sequal.model').Patient;
//const payerIdForUHC = ["87726", "5", "12", "8", "7", "IVR1251"];
//rabbitmq connection
//const amqp = require('amqplib');
//const amqp = require('amqp-connection-manager');

//var connection;
//let channelWrapper;
//async function connectRabbit() {
//  const amqpServer = "amqp://admin:1234567@rabbitmq:5672";
  //const amqpServer = 'amqp://localhost:5672'
 // connection = amqp.connect([amqpServer]);
 // connection.on('connect', () => console.log('Connected to RabbitMQ'));
  //connection.on('disconnect', params => console.log('Disconnected from RabbitMQ', params.err.stack));
//}
// async function openChannelAndPurgeQueue() {
//   let connection;
//   let channel;

//   try {
//     // Create a connection to RabbitMQ
//     connection = await amqp.connect('amqp://localhost');

//     // Create a channel
//     channel = await connection.createChannel();

//     // Assert a queue (optional, if the queue doesn't exist yet)
//     await channel.assertQueue('myQueue');

//     // Purge the queue
//     await channel.purgeQueue('myQueue');

//     console.log('Queue purged successfully.');
//   } catch (error) {
//     console.error('Error:', error);
//   } finally {
//     // Close the channel and connection when done or on error
//     try {
//       if (channel) await channel.close();
//       if (connection) await connection.close();
//     } catch (closeError) {
//       console.error('Error closing channel/connection:', closeError);
//     }
//   }
// }

// Call the function to open channel and purge queue

const app = express();
app.use(bodyParser.json());
//connectRabbit()
router.post('/', async (req, res) => {
  console.log("api for call")
  const token = req.headers['authorization'];
  const jsonData = req.body;
  const patientData = jsonData.patient[0];
  if (jsonData.patient[0].payer)
    var payerData = jsonData.patient[0].payer[0];
  try {
    let responseData;
    // if (!payerData || payerIdForUHC.includes(payerData.payerId)) {
    //   console.log("in UHC calling");
    //   channelWrapper = connection.createChannel({
    //     setup: (channel) => {
    //       // Assert the queue
    //       channel.assertQueue('CLAIMMD', { durable: true });
    //       return channel.prefetch(1);
    //     }
    //   });
    //   let jsonDataSend = await channelWrapper.sendToQueue('UHCSERVE', Buffer.from(JSON.stringify(jsonData)));

    //   // Purge the CLAIMMD queue
    //   await channelWrapper.purgeQueue('CLAIMMD');

    //   // Consume the message from CLAIMMD queue
    //   try {
    //     await channelWrapper.addSetup(async (channel) => {

    //       await channel.consume('CLAIMMD', async (data) => {
    //         //console.log("======",data.content);
    //         responseData = JSON.parse(data.content.toString());
    //         console.log("hell is well", responseData);
    //         // if(responseData && !responseData.faultCode);
    //         //channel.ack(data);
    //         res.status(201).json({ success: 'Data inserted successfully', responseData });
    //         await channel.close();
    //       });
    //     });
    //   }
    //   catch (error) {
    //     console.log("Error in chanel wrapper", error);
    //   }
    // }
    // else {
      const client = await pool.connect();
      try {

        if (jsonData.patient[0].medication) {
          var medicationDataNdc = jsonData.patient[0].medication.map(value => value.ndc);
          var medicationDataRxcui = jsonData.patient[0].medication.map(value => value.rxcui);
        }

        if (jsonData.patient[0].condition) {
          var conditionDataIcd = jsonData.patient[0].condition.map(value => value.icd10);
          var conditionDataConditionName = jsonData.patient[0].condition.map(value => value.icd10);
        }

        await client.query('BEGIN'); // Start transaction

        const provider = jsonData.provider;
        const providerQuery = 'INSERT INTO public.providers(id,data) VALUES (gen_random_uuid(),$1) RETURNING id';
        const providerValues = [provider];
        const providerResult = await pool.query(providerQuery, providerValues);
        const providerId = providerResult.rows[0].id;

        // Insert Data into Patient specific fields
        const organizationName = provider.organizationName;
        const providernpi = provider.npi;
        const patient = jsonData.patient[0];
        const patientQuery = `INSERT INTO public.patients (id,provider_id, firstname, middlename,lastName, dateofBirth, gender, ssn, mbi, address,providernpi,organizationname) VALUES (gen_random_uuid(),$1, $2, $3, $4, $5, $6, $7, $8, $9,$10, $11) RETURNING id;`;
        const patientValues = [providerId, patient.firstname, patient.middlename, patient.lastname, patient.dateOfBirth, patient.gender, patient.ssn, patient.mbi, JSON.stringify(patient.address), providernpi, organizationName];
        const patientResult = await pool.query(patientQuery, patientValues);
        const patientId = patientResult.rows[0].id;


        if (patient.payer && patient.payer.length > 0) {
          // Insert data into the Payer table
          const payer = patient.payer[0];
          const payerQuery = 'INSERT INTO public.payers(id,patient_id, data) VALUES (gen_random_uuid(),$1,$2)';
          const payerValues = [patientId, payer];
          await client.query(payerQuery, payerValues);
        }

        if (patient.encounter && patient.encounter.length > 0) {
          const encounter = patient.encounter[0];
          const encounterQuery = 'INSERT INTO public.encounters(id,patient_id, data) VALUES (gen_random_uuid(),$1,$2)';
          const encounterValues = [patientId, encounter];
          await client.query(encounterQuery, encounterValues);
        }

        if (patient.medication && patient.medication.length > 0) {
          const medication = patient.medication[0];
          const medicationQuery = 'INSERT INTO public.medications(id,patient_id,data) VALUES (gen_random_uuid(),$1,$2)';
          const medicationValues = [patientId, medication];
          await client.query(medicationQuery, medicationValues);
        }


        if (patient.condition && patient.condition.length > 0) {
          const condition = patient.condition[0];
          const conditionQuery = 'INSERT INTO public.conditions(id,patient_id,data) VALUES (gen_random_uuid(),$1,$2)';
          const conditionValues = [patientId, condition];
          await client.query(conditionQuery, conditionValues);
        }

        if (patient.careProgramEligible && patient.careProgramEligible.length > 0) {
          const careProgramEligible = patient.careProgramEligible[0];
          const careProgramEligibleQuery = 'INSERT INTO public.careprogrameligibles(id,patient_id,careProgram) VALUES (gen_random_uuid(),$1,$2)';
          const careProgramEligibleValues = [patientId, careProgramEligible];
          await client.query(careProgramEligibleQuery, careProgramEligibleValues);
        }

        await client.query('COMMIT');
        console.log("About to make POSt request")
        let responseData = await makePostRequest(patientId);
        console.log("Patient Data Inserted Successfully");
        if (responseData && responseData?.elig?.error[0]?.error_code && responseData?.elig?.error[0]?.error_code < 100 || responseData?.elig?.error[0]?.error_code > 599) {
          responseData.elig.error[0].error_code = 500;
          return res.status(responseData?.elig?.error[0]?.error_code).json({ failed: responseData?.elig?.error[0]?.error_mesg, responseData });
        } else if(responseData && responseData?.elig && responseData?.elig?.error[0]?.error_code > 100 || responseData?.elig?.error[0]?.error_code < 599) {
          return res.status(responseData?.elig?.error[0]?.error_code).json({ success: responseData?.elig?.error[0]?.error_mesg, responseData });
        } else if (responseData && responseData.status){
          return res.status(responseData.status).json({ success: 'Data inserted successfully', responseData });
        }
      } catch (error) {
        console.error('Error inserting data:', error);
        // if (responseData?.elig?.error[0]?.error_code)
        // return res.status(responseData?.elig?.error[0]?.error_code).json({ success: responseData?.elig?.error[0]?.error_mesg, responseData });
      }
      finally {
        client.release(true);
      }
    //}


  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ error: 'Error inserting data' });
  }
});

module.exports = router; // Export the router middleware function
