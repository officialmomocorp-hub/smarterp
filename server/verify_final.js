const axios = require('axios');
async function run() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      emailOrPhone: '9999999999',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('Login Success');
    
    const dashRes = await axios.get('http://localhost:5000/api/v1/dashboard/student', {
      headers: { Authorization: \Bearer \\ }
    });
    console.log('Dashboard Data:', JSON.stringify(dashRes.data, null, 2));
  } catch (e) {
    console.error('Error:', e.response?.data || e.message);
  }
}
run();
