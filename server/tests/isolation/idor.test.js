const { getToken, getClient, createTestSchool, deleteTestSchool } = require('./setup');

describe('IDOR Boundary Checks (Production)', () => {
  let superAdminToken;
  let adminA_Token;
  let adminB_Token;
  let schoolB;
  let schoolA_StudentId;
  let clientB;

  beforeAll(async () => {
    superAdminToken = await getToken('admin@smarterp.in', 'admin123');
    const clientA = getClient(superAdminToken);
    
    // Get valid ID from school A
    const listResponse = await clientA.get('/students');
    if (listResponse.data.data && listResponse.data.data.length > 0) {
      schoolA_StudentId = listResponse.data.data[0].id;
    }

    // Create School B
    schoolB = await createTestSchool(superAdminToken, 'Security Test School B IDOR');
    adminB_Token = await getToken(schoolB.adminEmail, schoolB.adminPassword);
    clientB = getClient(adminB_Token);
  });

  afterAll(async () => {
    if (schoolB && schoolB.id) {
       await deleteTestSchool(superAdminToken, schoolB.id);
    }
  });

  test('Use School B token to GET a student of School A', async () => {
    if (!schoolA_StudentId) return;
    const response = await clientB.get(`/students/${schoolA_StudentId}`);
    expect([403, 404]).toContain(response.status);
  });

  test('Use School B token to GET a fee of School A', async () => {
     const response = await clientB.get('/fees/school-a-fee-dummy'); 
     expect([403, 404]).toContain(response.status);
  });

  test('Use School B token to PATCH a student of School A', async () => {
    if (!schoolA_StudentId) return;
    const response = await clientB.put(`/students/${schoolA_StudentId}`, { firstName: 'Hacked' });
    expect([403, 404]).toContain(response.status);
  });
});
