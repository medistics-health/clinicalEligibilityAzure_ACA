//New db connection

const FormData = require("form-data");
const axios = require("axios");
require('dotenv').config();
const {pool }= require('../config/db'); // Import the database connections
const bodyParser = require("body-parser");
const moment = require("moment");

const selectQuery =
  "SELECT  data, patient_id,data->>'payerId' as PayerId,data ->'subscriber'->>'relationship' as relationship,firstname,lastname,dateofbirth,providernpi,organizationname,address->> 'city' as city FROM public.payers Join public.patients on public.patients.id= public.payers.patient_id ORDER BY public.patients.created_at DESC LIMIT 1;";

  
const transformEligibilityData = async (responseData, claimResultId, status) => {
    const elig = responseData.elig;
    console.log("Main Response "+elig);
    // Group benefits by insurance type first
    const benefitsByInsurance = {};
    elig.benefit.forEach(benefit => {
        const insuranceType = benefit.insurance_type_code || 'PR'; // Default to PR for UHC
        if (!benefitsByInsurance[insuranceType]) {
            benefitsByInsurance[insuranceType] = [];
        }
        benefitsByInsurance[insuranceType].push(benefit);
    });

    // Create the transformed data structure
    const transformedData = {
        patient: [{
            id: await fetchDataFromDatabase("", true),
            firstName: elig.ins_name_f,
            lastName: elig.ins_name_l,
            middleName: elig.ins_name_m,
            dateOfBirth: elig.ins_dob,
            gender: elig.ins_sex,
            mbi: elig.benefit.some(b => b.insurance_type_code === "MB") ? elig.ins_number : null,
            address: [{
                address1: elig.ins_addr_1,
                address2: null,
                city: elig.ins_city,
                state: elig.ins_state,
                postalCode: elig.ins_zip,
                countryCode: "001"
            }],
            memberPolicies: []
        }]
    };

    // Process each insurance type
    Object.entries(benefitsByInsurance).forEach(([insuranceType, benefits]) => {
        const insuranceInfo = benefits.find(b => 
            (b.benefit_code === "30" && b.benefit_coverage_description === "Active Coverage") ||
            (b.insurance_type_code === "PR" && b.entity_name || null)
        );

        const payerAddress = insuranceInfo && insuranceInfo.entity_addr_1 ? {
            address1: insuranceInfo.entity_addr_1[0] || null,
            address2: null,
            city: insuranceInfo.entity_city?.[0] || null,
            state: insuranceInfo.entity_state?.[0] || null,
            postalCode: insuranceInfo.entity_zip?.[0] || null,
            countryCode: "001"
        } : null;

        const policy = {
            insuranceInfo: [{
                payerId: null,
                memberId: elig.ins_number,
                groupNumber: elig.group_number || null,
                payerName: insuranceInfo?.entity_name?.[0] || insuranceInfo?.insurance_type_description || "Unknown",
                payerStatus: "Active",
                insuranceType: insuranceInfo?.insurance_type_description || "Unknown",
                planDescription: insuranceInfo?.insurance_plan || insuranceInfo?.benefit_description || "Health Benefit Plan Coverage",
                phoneNumber: insuranceInfo?.entity_phone?.[0] || null,
                address: payerAddress
            }],
            policyInfo: [{
                eligibilityDates: {
                    startDate: elig.plan_begin_date?.split('-')[0] || elig.plan_date || elig.benefit[0].eligibility_begin || null,
                    endDate: elig.plan_begin_date?.split('-')[1] || elig.plan_end_date  || elig.benefit[0].eligibility_end || null,
                },
                memberId: elig.ins_number,
                planDates: {
                    startDate: elig.plan_begin_date?.split('-')[0] || elig.plan_date || elig.benefit[0].eligibility_begin,
                    endDate: elig.plan_begin_date?.split('-')[1] || elig.plan_end_date || elig.benefit[0].eligibility_end,
                },
                policyStatus: "Active Policy",
                searchedDates: {
                    searchStartDate: elig.elig_result_date,
                    searchEndDate: elig.elig_result_date
                },
                primary: insuranceType === "MA" || insuranceType === "PR" ? "primary" : "secondary",
                coverageType: "Medical",
                nonMedicalPolicyBoolean: false,
                plnBenefit: false,
                ddpProvider: false,
                ddpBenefit: false
            }],
            serviceLevelBenefit: [],
            planLevelBenefits: []
        };
        // Only add `planLevelBenefits` if it is not an empty array
        const planLevelBenefits = [];
        if (planLevelBenefits.length > 0) {
            policy.planLevelBenefits = planLevelBenefits;
        }

        benefits.forEach(benefit => {
            const isPlanLevelBenefit = 
                benefit.benefit_code === "30" && 
                (benefit.benefit_coverage_description === "Out of Pocket (Stop Loss)" ||
                 benefit.benefit_coverage_description === "Deductible" ||
                 benefit.benefit_coverage_description === "Active Coverage");

            const isServiceBenefit = 
                benefit.benefit_code && 
                benefit.benefit_description &&
                benefit.benefit_description !== "Unknown benefit code." &&
                !isPlanLevelBenefit &&
                (benefit.benefit_coverage_description === "Active Coverage" ||
                 benefit.benefit_coverage_description === "Co-Payment" ||
                 benefit.benefit_coverage_description === "Co-Insurance");

            if (isPlanLevelBenefit) {
                policy.planLevelBenefits.push({
                    networkStatus: benefit.inplan_network === "Y" ? "In Network" : 
                                  benefit.inplan_network === "N" ? "Out of Network" : 
                                  "Both",
                    benefit_coverage_code: benefit.benefit_coverage_code,
                    place_of_service: benefit.place_of_service || null,
                    benefit_code: benefit.benefit_code,
                    benefit_description: benefit.benefit_description,
                    benefit_notes: benefit.benefit_notes,
                    benefit_level_description: benefit.benefit_level_description || "Individual",
                    benefit_level_code: benefit.benefit_level_code || "IND",
                    benefit_coverage_description: benefit.benefit_coverage_description,
                    benefit_amount: benefit.benefit_amount || "0",
                    benefit_period_description: benefit.benefit_period_description,
                    benefit_period_code: benefit.benefit_period_code,
                    insurance_type_code: benefit.insurance_type_code,
                    delivery_pattern: benefit.delivery_pattern
                });
            }
            
            if (isServiceBenefit) {
                policy.serviceLevelBenefit.push({
                    networkStatus: benefit.inplan_network === "Y" ? "In Network" : 
                                  benefit.inplan_network === "N" ? "Out of Network" : 
                                  "Both",
                    benefit_coverage_code: benefit.benefit_coverage_code,
                    place_of_service: benefit.place_of_service || null,
                    benefit_code: benefit.benefit_code,
                    benefit_description: benefit.benefit_description,
                    benefit_notes: benefit.benefit_notes,
                    benefit_level_description: benefit.benefit_level_description || "Individual",
                    benefit_level_code: benefit.benefit_level_code || "IND",
                    benefit_coverage_description: benefit.benefit_coverage_description,
                    benefit_amount: benefit.benefit_amount || "0",
                    benefit_Percent: benefit.benefit_percent || 0,
                    benefit_period_description: benefit.benefit_period_description,
                    benefit_period_code: benefit.benefit_period_code,
                    insurance_type_code: benefit.insurance_type_code,
                    delivery_pattern: benefit.delivery_pattern,
                    proc_code: benefit.proc_code,
                    service: benefit.service,
                    admission: benefit.admission,
                    benefit: benefit.benefit,
                    benefit_qnty: benefit.benefit_qnty,
                    entity_code: benefit.entity_code,
                    entity_description: benefit.entity_description,
                    insurance_type_description: benefit.insurance_type_description,
                    inplan_network: benefit.inplan_network
                });
            }
        });

        if (policy.planLevelBenefits.length > 0 || policy.serviceLevelBenefit.length > 0) {
            transformedData.patient[0].memberPolicies.push(policy);
        }
    });

    try {
        let transformedDataJSON = JSON.stringify(transformedData);
        const updateTransformedResponse = `UPDATE public.claimmdresponses SET predefinedresponse = $1 WHERE id = $2`;
        const values = [transformedDataJSON, claimResultId];
        console.log("Transformed data saved");
        await pool.query(updateTransformedResponse, values);
    } catch (error) {
        console.error("Error inserting data:", error.message);
    }
    transformedData.status = status;
    return transformedData;
};



async function fetchDataFromDatabase(patientId, ptid) {
  const client = await pool.connect();
  try {
    
    const result = await client.query(selectQuery);
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, "");
    const resData = result.rows[0];
    console.log("Patient id fetchdata " + JSON.stringify(resData),result);
    const pid = resData.patient_id;
    const payerId = result.rows[0].data.payerId;
    console.log("Payer id " + payerId);
    const payerMasterQuery = `SELECT id, payer_name, apipayerid, payerid FROM public.payermasters where apipayerid = '${payerId}';`;
    const PayerResult = await client.query(payerMasterQuery);
    const payerresData = PayerResult.rows[0];
    console.log("Payer response  " + JSON.stringify(payerresData));
    console.log("Account Key claimmd" +process.env.ACCOUNT_KEY_CLAIMMD);
    if (payerresData === undefined)
      {
        return {error:"No Payer found in the database"};
      }

    if (ptid) {
      return resData.patient_id;
    }
    const patrel = result.rows[0].data.subscriber;

   

    if (result.rows.length > 0) {
      let pat_rel;
      if (patrel.relationship === "self") {
        pat_rel = "18";
      } else {
        pat_rel = "g8";
      }

      const formData = new FormData();
      const rowData = {
        AccountKey: process.env.ACCOUNT_KEY_CLAIMMD,
        ins_name_l: resData.lastname,
        ins_name_f: resData.firstname,
        payerid: payerresData.payerid,
        pat_rel: pat_rel,
        fdos: formattedDate,
        prov_npi: resData.providernpi,
        ins_number: resData.data.memberId,
        ins_dob: moment(resData.dateofbirth).format("YYYY-MM-DD"),
      };
      console.log("Claim Md response Inside " + JSON.stringify(rowData) + " Patient Id " + pid);
      const claimQuery = `INSERT INTO public.claimmdresponses(id,request,patient_id) VALUES (gen_random_uuid(),$1,$2) RETURNING id;`;
      const claimValues = [rowData, pid];
      const claimResult = await pool.query(claimQuery, claimValues);
      const claimResultId = claimResult.rows[0].id;
      console.log("claim Result Id" + JSON.stringify(claimResultId));

      for (const key in rowData) {
        console.log("key",key)
        formData.append(key, rowData[key]);
      }
      return { formData, claimResultId };
    } else {
      throw new Error("No data found in the database");
    }
	
  } catch (error) {
    console.log("error",error);
    throw new Error("Error fetching data from the database: " + error.message);
  }
  finally {
    client.release(true);
  }
}

async function makePostRequest(patientId) {
  try {
    console.log("patient Id claimmd " + patientId);
    const { formData, claimResultId,error } = await fetchDataFromDatabase(patientId);
    if (error)
      {
        return "Payer is not valid for eligibility";
      }
    const response = await axios.post("https://www.claim.md/services/eligdata/",formData);
    await saveResponseToDatabase(response.data, claimResultId, patientId);
    // return response.data; // Return the response data
    console.log("response status " + JSON.stringify(response.data));
    // const mappedData = mapResponseToPreDefined(response.data, claimResultId);
    // return mappedData;

    if (response.data.elig && response.status === 200) {
      if(response.data.elig.error)
        {
          console.log("response status 2 " + JSON.stringify(response.data));
          return response.data;
        }
      const mappedData = transformEligibilityData(response.data, claimResultId, response.status);
      return mappedData;
    }
    else if (response.data.error && response.status === 200) {
      console.log("response status 5 " + JSON.stringify(response.status ));
      return response.data;
    }
    else {
      return res.status(500).json({ success: 'JSON structure undefined' });
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
//
async function saveResponseToDatabase(responseData, claimResultId, patientId) {
  const client = await pool.connect();
  try {
    
    const updatepatient = `UPDATE public.patients SET claimmdresponse = $1 WHERE id = $2`;
    const patientvalues = [responseData, patientId];
    const patientresponse = await pool.query(updatepatient, patientvalues);
    const updateclaim = `UPDATE public.claimmdresponses SET response = $1 WHERE id = $2`;
    const claimvalues = [responseData, claimResultId];
    const claimresponse = await pool.query(updateclaim, claimvalues);
  } catch (error) {
    console.error("Error inserting data:", error.message);
  }finally {
    client.release(true);
  }
}

module.exports = { fetchDataFromDatabase, makePostRequest };
