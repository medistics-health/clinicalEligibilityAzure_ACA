const bcrypt = require('bcrypt');
// Function to hash a password with salting
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10); // Adjust salt rounds based on security needs
    return await bcrypt.hash(password, salt);
  }

  // Function to compare hashed password with login attempt
async function comparePassword(hashedPassword, plainTextPassword) {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }
// Registration process (replace with your user creation logic)
async function registerUserHashing(userData) {
    const hashedPassword = await hashPassword(userData.password);
    userData.password = hashedPassword; // Replace plain text password with hash
    return userData;
    // Create user with updated password in the database
  }
  
module.exports = {registerUserHashing,hashPassword,comparePassword}