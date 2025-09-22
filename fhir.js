const { createResource } = require('fhir-kit-client');

// Normal JSON object representing patient data
const normalJson = {
  firstname: 'Umesh',
  lastname: 'Bhalerao',
  dateOfBirth: '1995-06-09',
  gender: 'male',
  ssn: '123456789',
  mbi: 'string',
  address: {
    address1: '123 address',
    address2: 'string',
    city: 'city',
    state: 'nj',
    postalCode: '070670000',
    countryCode: 'string'
  }
};

const payerJson = {
  payerId: "87726",
  memberId: "117308814",
  subscriber: {
    subFirstName: "string",
    subLastName: "string",
    subMiddleName: "string",
    subDOB: "YYYYMMDD",
    relationship: "self"
  }
};

// Mapping to FHIR Patient resource structure
const fhirPatient = {
  resourceType: 'Patient',
  name: [
    {
      given: [normalJson.firstname],
      family: normalJson.lastname
    }
  ],
  birthDate: normalJson.dateOfBirth,
  gender: normalJson.gender,
  identifier: [
    {
      system: 'http://hl7.org/fhir/sid/us-ssn',
      value: normalJson.ssn
    },
    {
      system: 'http://example.com/mbi',
      value: normalJson.mbi
    }
  ],
  address: [
    {
      line: [normalJson.address.address1, normalJson.address.address2],
      city: normalJson.address.city,
      state: normalJson.address.state,
      postalCode: normalJson.address.postalCode,
      country: normalJson.address.countryCode
    }
  ]
};

console.log(JSON.stringify(fhirPatient, null, 2));

const fhirResource = {
  resourceType: 'Coverage',
  id: '1',
  identifier: [
    {
      system: 'http://example.com/payerId',
      value: '87726'
    },
    {
      system: 'http://example.com/memberId',
      value: '117308814'
    }
  ],
  subscriber: {
    name: [
      {
        given: ['string'], // Placeholder value for subFirstName
        family: 'string' // Placeholder value for subLastName
      }
    ],
    birthDate: 'YYYYMMDD', // Placeholder value for subDOB
    relationship: {
      coding: [
        {
          system: 'http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype',
          code: 'self'
        }
      ]
    }
  }
};

console.log(JSON.stringify(fhirResource, null, 2));

const medicationJson = {
    ndc: 'string',
    rxcui: ''
  };
  
  const conditionJson = {
    icd10: 'I10',
    conditionName: 'Hypertension'
  };
  
  // Mapping to FHIR Medication resource structure
  const fhirMedication = {
    resourceType: 'Medication',
    code: {
      coding: [
        {
          system: 'http://hl7.org/fhir/sid/ndc',
          code: medicationJson.ndc
        },
        {
          system: 'http://rxnav.nlm.nih.gov/REST/rxcui',
          code: medicationJson.rxcui
        }
      ]
    }
  };
  
  console.log(JSON.stringify(fhirMedication, null, 2));
  
  // Mapping to FHIR Condition resource structure
  const fhirCondition = {
    resourceType: 'Condition',
    code: {
      coding: [
        {
          system: 'http://hl7.org/fhir/sid/icd-10',
          code: conditionJson.icd10
        }
      ],
      text: conditionJson.conditionName
    }
  };
  
  console.log(JSON.stringify(fhirCondition, null, 2));
