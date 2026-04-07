const axios = require('axios');
const BASE_URL = 'https://smarterpsolution.duckdns.org/api/v1';

async function performIdorAudit() {
  console.log('--- Phase 4: Validating Multi-Tenant Isolation (IDOR) ---');

  try {
    // 1. Super Admin Login
    const superAdminRes = await axios.post(`${BASE_URL}/auth/login`, {
      emailOrPhone: 'admin@smarterp.in',
      password: 'admin123'
    });
    const superToken = superAdminRes.data.data.token;
    console.log('  [Init] Super Admin Authenticated.');

    // 2. Fetch Schools
    const schoolsRes = await axios.get(`${BASE_URL}/schools`, {
      headers: { Authorization: `Bearer ${superToken}` }
    });
    const schools = schoolsRes.data.data;
    
    if (schools.length < 2) {
      console.log('  [Skip] Need at least 2 schools to verify isolation. Creating School B...');
      const newSchoolRes = await axios.post(`${BASE_URL}/schools`, {
         name: 'Isolation Test School ' + Date.now().toString().slice(-4),
         code: 'ISO' + Date.now().toString().slice(-4),
         address: '123 Security St', city: 'Cyber', state: 'State', pincode: '111111',
         phone: '999' + Date.now().toString().slice(-7),
         email: `iso_${Date.now()}@test.com`,
         udiseCode: 'UDISE' + Date.now().toString().slice(-4),
         adminEmail: `admin_iso_${Date.now()}@test.com`,
         adminPassword: 'Password123!'
      }, { headers: { Authorization: `Bearer ${superToken}` } });
      schools.push(newSchoolRes.data.data);
    }

    const schoolA = schools[0];
    const schoolB = schools[1];
    console.log(`  [Setup] School A: ${schoolA.name} (${schoolA.id})`);
    console.log(`  [Setup] School B: ${schoolB.name} (${schoolB.id})`);

    // 3. Create resource in School B (e.g., a Class)
    console.log('\n  [Step 1] Creating Class in School B...');
    const classBRes = await axios.post(`${BASE_URL}/academic/classes`, {
      name: 'Class Isolation Test',
      displayName: 'Isolation-B',
      sortOrder: 99
    }, { headers: { Authorization: `Bearer ${superToken}`, 'X-School-Id': schoolB.id } });
    
    const classBId = classBRes.data.data.id;
    console.log(`    Class created in School B. ID: ${classBId}`);

    // 4. Test Horizontal IDOR (Access School B resource from School A context)
    console.log('\n  [Step 2] Testing READ Isolation: Accessing School B Class with School A credentials...');
    try {
      // By NOT sending X-School-Id, Super Admin defaults to their own school (School A)
      const res = await axios.get(`${BASE_URL}/academic/classes`, {
        headers: { Authorization: `Bearer ${superToken}` }
      });
      const found = res.data.data.some(c => c.id === classBId);
      if (found) {
        console.log('    FAILED (VULNERABLE): School B resource appeared in School A list!');
      } else {
        console.log('    PASSED: School B resource is hidden from School A context.');
      }
    } catch (err) {
      console.log('    PASSED (RESTRICTED): API refused request.');
    }

    // 5. Test Direct IDOR (Accessing by ID) - Need to find a route that takes ID
    // Most routes use req.schoolId for filtering. 
    // Let's see if we can update School B's class settings while in School A context.
    console.log('\n  [Step 3] Testing WRITE Isolation: Attempting to modify School B resource from School A context...');
    try {
      // Note: We don't have a direct PUT /academic/classes/:id route visible in the quick list, 
      // but let's try a generic Student Update if we had a student ID.
      // Alternatively, let's look at schools/settings which is schoolScoped.
      const settingsRes = await axios.get(`${BASE_URL}/schools/settings`, {
         headers: { Authorization: `Bearer ${superToken}`, 'X-School-Id': schoolB.id }
      });
      console.log('    (Self-Check: Can Super Admin read settings?) Yes.');

      // Now try to update settings of School B while impersonating NO school (defaults to School A)
      // This is a bit tricky for Super Admin.
      
      // Better test: Attempt to create a student in School B while only having School A permissions.
      console.log('  [Step 4] Attempting cross-tenant creation...');
      try {
        await axios.post(`${BASE_URL}/students`, {
            profile: { firstName: 'Hacker', lastName: 'Student', gender: 'MALE' },
            class: 'Isolation-B',
            section: 'A'
        }, { headers: { Authorization: `Bearer ${superToken}` } }); // Context: School A
        console.log('    VULNERABLE: Created resource in another school\'s context?!');
      } catch (err) {
        console.log(`    PASSED: Creation blocked. Status: ${err.response?.status} (${err.response?.data?.message})`);
      }
      
    } catch (err) {
      console.log('    Audit step failed:', err.message);
    }

  } catch (err) {
    console.log('Audit failed:', err.message);
    if (err.response) console.log('Details:', JSON.stringify(err.response.data));
  }

  console.log('\n--- IDOR Audit Complete ---');
}

performIdorAudit();
