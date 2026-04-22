const { getToken, getClient, createTestSchool, deleteTestSchool } = require('./setup');

async function runVerification() {
  console.log('--- Tier 1 Isolation Verification ---');
  
  try {
    const superAdminToken = await getToken('admin@smarterp.in', 'admin123');
    const clientA = getClient(superAdminToken);
    
    // 1. Get School A Student
    const listRes = await clientA.get('/students');
    const students = listRes.data.data.students || [];
    if (students.length === 0) {
      console.log('No students found in School A to test with.');
      return;
    }
    const studentA = students[0];
    console.log(`Found School A Student: ${studentA.id} (School: ${studentA.schoolId})`);

    // 2. Create School B
    console.log('Creating School B...');
    const schoolB = await createTestSchool(superAdminToken, 'Verification School B');
    const adminBToken = await getToken(schoolB.adminEmail, schoolB.adminPassword);
    const clientB = getClient(adminBToken);
    console.log(`School B Admin Token obtained. School B ID: ${schoolB.id}`);

    // 3. Attempt Breach
    console.log(`Attempting to access School A student ${studentA.id} with School B token...`);
    const breachRes = await clientB.get(`/students/${studentA.id}`);
    
    console.log(`Status: ${breachRes.status}`);
    if (breachRes.status === 200) {
      console.error('CRITICAL FAILURE: IDOR detected! School B can read School A student.');
      console.log('Body School ID:', breachRes.data.data.schoolId);
    } else {
      console.log(`SUCCESS: Access denied with status ${breachRes.status}.`);
    }

    // 4. Cleanup
    await deleteTestSchool(superAdminToken, schoolB.id);
    
  } catch (err) {
    console.error('Verification Script Errored:', err.message);
  }
}

runVerification();
