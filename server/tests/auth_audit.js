const axios = require('axios');

const BASE_URL = 'https://smarterpsolution.duckdns.org/api/v1';

async function auditBrokenAuth() {
  console.log('--- Starting Broken Authentication Audit (Post-Fix) ---');

  // Test 1: Username Enumeration via Forgot Password
  console.log('\n[Phase 3] Testing Username Enumeration via Forgot Password...');
  try {
    const resExist = await axios.post(`${BASE_URL}/auth/forgot-password`, { emailOrPhone: 'admin@smarterp.in' });
    console.log('  Valid User Prompt:', resExist.status, resExist.data.message);
  } catch (err) {
    console.log('  Valid User Err:', err.response?.status, err.response?.data?.message);
  }

  try {
    const resNotExist = await axios.post(`${BASE_URL}/auth/forgot-password`, { emailOrPhone: 'attacker_probing@test.com' });
    console.log('  Invalid User Prompt:', resNotExist.status, resNotExist.data.message);
  } catch (err) {
    console.log('  Invalid User Err:', err.response?.status, err.response?.data?.message);
  }

  // Test 2: Logout and Token Blacklisting
  console.log('\n[Phase 8] Testing Logout and Token Blacklisting...');
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, { emailOrPhone: 'admin@smarterp.in', password: 'admin123' });
    const token = loginRes.data.data.token;
    console.log('  Logged in. Token acquired.');

    // Logout
    await axios.post(`${BASE_URL}/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });
    console.log('  Logged out. Token should be blacklisted.');

    // Attempt to use token again
    try {
      await axios.get(`${BASE_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('  VULNERABLE: Token still works after logout!');
    } catch (err) {
      console.log('  SECURE: Token rejected after logout:', err.response?.status, err.response?.data?.message);
    }
  } catch (err) {
    console.log('  Logout test failed:', err.message);
  }

  console.log('\n--- Audit Complete ---');
}

auditBrokenAuth();
