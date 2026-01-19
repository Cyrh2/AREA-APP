const axios = require('axios');

const API_BASE = 'http://localhost:8080';

async function createTestUser() {
    console.log('👤 Creating test user...');
    
    try {
        const response = await axios.post(`${API_BASE}/auth/register`, {
            email: 'toni@gmail.com',
            password: 'F4ther@lmighty',
            username: 'Toni23'
        });
        
        console.log('✅ Test user created:', response.data.user.email);
        console.log('Token:', response.data.token);
        return response.data.token;
        
    } catch (error) {
        // If user exists, try to login
        if (error.response?.data?.error?.includes('already registered')) {
            console.log('⚠️ User exists, logging in...');
            const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
                email: 'toni@gmail.com',
                password: 'F4ther@lmighty'
            });
            
            console.log('✅ Logged in successfully');
            return loginResponse.data.token;
        }
        throw error;
    }
}

module.exports = { createTestUser };