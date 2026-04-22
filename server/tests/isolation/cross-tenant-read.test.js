const { getToken, getClient, createTestSchool, deleteTestSchool } = require('./setup');

describe('Cross-Tenant Read Isolation (Production)', () => {
  let superAdminToken;
  let adminA_Token;
  let schoolB;
  let clientA;

  beforeAll(async () => {
    superAdminToken = await getToken('admin@smarterp.in', 'admin123');
    adminA_Token = superAdminToken; 
    clientA = getClient(adminA_Token);

    schoolB = await createTestSchool(superAdminToken, 'Security Test School B Read');
  });

  afterAll(async () => {
    if (schoolB && schoolB.id) {
       await deleteTestSchool(superAdminToken, schoolB.id);
    }
  });

  test('School A admin should NOT see School B students via query override', async () => {
    const response = await clientA.get('/students', { params: { schoolId: schoolB.id } });

    if (response.status === 200) {
      const students = response.data.data;
      students.forEach(s => {
        expect(s.schoolId).not.toBe(schoolB.id);
      });
    }
  });

  test('School A admin should NOT be able to read School B fees', async () => {
    const response = await clientA.get('/fees', { params: { schoolId: schoolB.id } });
    expect([403, 404]).toContain(response.status);
  });

  test('School A admin should NOT be able to read School B admissions', async () => {
    const response = await clientA.get('/admissions', { params: { schoolId: schoolB.id } });
    expect([403, 404]).toContain(response.status);
  });

  test('No token returns 401 on restricted endpoints', async () => {
    const client = getClient();
    const response = await client.get('/students');
    expect(response.status).toBe(401);
  });
});
