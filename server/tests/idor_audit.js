const axios = require('axios');
const BASE_URL = 'https://smarterpsolution.duckdns.org/api/v1';

async function performIdorAudit() {
  console.log('--- Starting IDOR (Multi-Tenant Isolation) Audit ---');

  try {
    // 1. Super Admin Login
    console.log('[Step 1] Logging in as Super Admin...');
    const superAdminRes = await axios.post(`${BASE_URL}/auth/login`, {
      emailOrPhone: 'admin@smarterp.in', // Using the global admin for setup
      password: 'admin123'
    });
    const superToken = superAdminRes.data.data.token;
    console.log('  Login successful.');

    // 2. Create School B (Tenant Isolation Test Case)
    console.log('[Step 2] Creating School B...');
    const schoolBRes = await axios.post(`${BASE_URL}/schools`, {
      name: 'Isolation Test School B',
      address: 'Security Ave, Cyber City',
      city: 'Cyber City',
      state: 'Techno State',
      pincode: '123456',
      phone: '9998887776',
      email: `school_b_${Date.now()}@test.com`,
      code: `SCHB${Date.now().toString().slice(-4)}`,
      udiseCode: `UDISE${Date.now().toString().slice(-4)}`,
      adminEmail: `admin_b_${Date.now()}@test.com`,
      adminPassword: 'Password123!'
    }, { headers: { Authorization: `Bearer ${superToken}`, 'Content-Type': 'application/json' } });

    const schoolBId = schoolBRes.data.data.id;
    console.log(`  School B created. ID: ${schoolBId}`);

    // 3. Create a student in School B
    console.log('[Step 3] Adding a Student in School B (via Super Admin impersonation)...');
    const studentBRes = await axios.post(`${BASE_URL}/students`, {
      profile: { firstName: 'Victim', lastName: 'Student', gender: 'MALE' },
      class: '10',
      section: 'A'
    }, { headers: { Authorization: `Bearer ${superToken}`, 'X-School-Id': schoolBId } });

    const studentBId = studentBRes.data.data.id;
    console.log(`  Victim Student created in School B. ID: ${studentBId}`);

    // 4. Horizontal IDOR Test: School A Admin tries to READ School B's student
    console.log('\n[Phase 1] Testing Horizontal IDOR (School A -> School B Read)...');
    try {
      const res = await axios.get(`${BASE_URL}/students/${studentBId}`, { 
        headers: { Authorization: `Bearer ${superToken}` } // Default school A
      });
      console.log('  VULNERABLE: Successfully read student data from another school!');
    } catch (err) {
      console.log(`  SECURE: Access denied. Status: ${err.response?.status} (${err.response?.data?.message})`);
    }

    // 5. Horizontal IDOR Test: School A Admin tries to UPDATE School B's student
    console.log('\n[Phase 2] Testing Horizontal IDOR (School A -> School B Write)...');
    try {
      await axios.put(`${BASE_URL}/students/${studentBId}`, {
        profile: { firstName: 'Hacked Name' }
      }, { headers: { Authorization: `Bearer ${superToken}` } });
      console.log('  VULNERABLE: Successfully modified student data in another school!');
    } catch (err) {
      console.log(`  SECURE: Modification denied. Status: ${err.response?.status} (${err.response?.data?.message})`);
    }

    // 6. Horizontal IDOR Test: List Enumeration check
    console.log('\n[Phase 3] Testing Tenant List Isolation...');
    const listRes = await axios.get(`${BASE_URL}/students`, { headers: { Authorization: `Bearer ${superToken}` } });
    const containsVictim = listRes.data.data.students.some(s => s.id === studentBId);
    if (containsVictim) {
      console.log('  VULNERABLE: Victim student appears in School A list!');
    } else {
      console.log('  SECURE: School A list does not contain School B students.');
    }

  } catch (err) {
    console.log('Audit setup failed:', err.message);
    if (err.response) console.log('Response Error:', err.response.data);
  }

  console.log('\n--- IDOR Audit Complete ---');
}

performIdorAudit();
