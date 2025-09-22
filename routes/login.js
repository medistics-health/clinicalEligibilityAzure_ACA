let jwt = require("jsonwebtoken");
const MasterUser = require("../model/masterUser.model");
require('dotenv').config();
const {registerUserHashing, comparePassword} = require("../helpers/authentication.helper")

function signJwtToken(payload) {
	return jwt.sign(
		payload,
		process.env.JWT_SECRET,
		{ expiresIn: '1h' }
	);
}

async function login(req, res) {
	const { email, password } = req.body;
	try {
		const user = await MasterUser.findOne({ where: { email } });
		console.log("=============",process.env.JWT_SECRET,DATABASE_HOST);
		if (!user) {
		  return res.status(401).json({ message: 'Invalid email or password' });
		}
		const isPasswordValid = await comparePassword(user.dataValues.password , password);
		if (!isPasswordValid) {
		  return res.status(401).json({ message: 'Please enter correct password' });
		}
	
		const token = signJwtToken({userId : user.dataValues.id, useremail : user.dataValues.email }); // Generate authentication token
		console.log("token value " , token);
		res.status(200).json({
		  success: true,
		  message: 'Login successful',
		  token, // Include the token in the responsesa
  });
	} 
	catch (error) {
	  console.error("error in login" , error);
	  return res.status(500).json({status : false , message : "User Login failed"}); 
	}
  }

  const updateNpi = async (req, res) => {
	const request = req.body;
	try {
		const { id,npi,taxId} = request;

		// Check for existing email
		const existingUserById = await MasterUser.findOne({ where: { id } });
		if (!existingUserById) {
		  return res.status(400).json({ success: false, message: 'User does not exist.' });
		}
		let objToUpdate = {};
		if(npi) objToUpdate.npi = npi;
		if(taxId) objToUpdate.taxId = taxId;
		if(Object.keys(objToUpdate).length){
		const user = await MasterUser.update(
			objToUpdate,
			{ where: { id: id } }
		  )
		}
				return res.status(200).json({status : true , message : "Npi updated Successfully"});
	} catch (error) {
		console.error("error in npi update " , error);
		return res.status(500).json({status : false , message : "Npi update failed"});
	}
}

const register = async (req, res) => {
	const request = req.body;
	try {
		const { email,password, npi,taxId} = request;

		// Check for existing emaila
		const existingUserByEmail = await MasterUser.findOne({ where: { email } });
		if (existingUserByEmail) {
		  return res.status(400).json({ success: false, message: 'Email already exists' });
		}

		const hashedUserObject = await registerUserHashing(request);
		const user = await MasterUser.create({
		  ...hashedUserObject,
		});
		return res.status(200).json({status : true , message : "User Registered Successfully" , id:user.dataValues.id});
	} catch (error) {
		console.error("error in registration " , error);
		return res.status(500).json({status : false , message : "User registration failed"});
	}
}

module.exports = { login , register,updateNpi};