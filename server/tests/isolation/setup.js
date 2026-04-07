const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

const getClient = (token = null) => {
  const config = {
    baseURL: BASE_URL,
    validateStatus: () => true
  };
  if (token) {
    config.headers = { Authorization: `Bearer ${token}` };
  }
  return axios.create(config);
};

const getToken = async (emailOrPhone, password) => {
  const response = await axios.post(`${BASE_URL}/auth/login`, { emailOrPhone, password });
  if (response.status !== 200) {
    throw new Error(`Login failed for ${emailOrPhone}: ${JSON.stringify(response.data)}`);
  }
  return response.data.data.token;
};

const createTestSchool = async (superAdminToken, schoolName) => {
  const code = `S${Date.now().toString().slice(-5)}`;
  const udise = `U${Date.now().toString().slice(-8)}`; // Fixed: Providing unique UDISE code
  const client = getClient(superAdminToken);
  const response = await client.post('/schools', {
    name: schoolName,
    code: code,
    udiseCode: udise, // Mandatory unique field
    email: `school_${code}@test.com`, // Mandatory field from schema
    adminEmail: `admin_${code}@test.com`,
    adminPassword: 'password123',
    address: 'Test Address',
    city: 'Test City',
    state: 'Test State',
    pincode: '000000',
    phone: `99${Date.now().toString().slice(-8)}`
  });
  
  if (response.status !== 201) {
    throw new Error(`School creation failed: ${JSON.stringify(response.data)}`);
  }
  
  return { 
    id: response.data.data.id, 
    code: code, 
    adminEmail: `admin_${code}@test.com`, 
    adminPassword: 'password123' 
  };
};

const deleteTestSchool = async (superAdminToken, schoolId) => {
  const client = getClient(superAdminToken);
  const response = await client.delete(`/schools/${schoolId}`);
  return response.status === 200;
};

module.exports = {
  BASE_URL,
  getToken,
  getClient,
  createTestSchool,
  deleteTestSchool
};
