const jwt = require('jsonwebtoken');
const axios = require('axios');

// Generate JWT token function
function generateToken(payload) {
    const secretKey = 'your_secret_key'; // Replace with your secret key
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
    return token;
} 

async function makeRequestWithToken() {
    const tokenPayload = {
        userId: 'user_id', // Replace with the user ID or any other data you want to include in the payload
        username: 'example_username' // Replace with the username or any other data you want to include in the payload
    };

    // Generate JWT token
    const token = generateToken(tokenPayload);

    // Include JWT token in the request header
    const headers = {
        Authorization: `Bearer ${token}`
    };

    try {
        // Make the HTTP request to the target API with the JWT token in the header
        const response = await axios.get('https://api.example.com/data', { headers });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Call the function to make the request with JWT token
makeRequestWithToken();
