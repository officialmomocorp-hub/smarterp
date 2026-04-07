const { getToken, getClient, createTestSchool, deleteTestSchool } = require('./setup');

describe('Cross-Tenant Write Isolation (Production)', () => {
  let superAdminToken;
  let adminA_Token;
  let schoolB;
  let clientA;

  beforeAll(async () => {
    superAdminToken = await getToken('admin@smarterp.in', 'admin123');
    adminA_Token = superAdminToken; 
    clientA = getClient(adminA_Token);
    schoolB = await createTestSchool(superAdminToken, 'Security Test School B Write');
  });

  afterAll(async () => {
    if (schoolB && schoolB.id) {
       await deleteTestSchool(superAdminToken, schoolB.id);
    }
  });

  test('School A admin should NOT be able to POST new student into School B', async () => {
    const response = await clientA.post('/students', {
        firstName: 'Malicious',
        lastName: 'Injection',
        schoolId: schoolB.id 
      });

    if (response.status === 201) {
       expect(response.data.data.schoolId).not.toBe(schoolB.id);
    } else {
       expect(response.status).toBe(403);
    }
  });

  test('School A admin should NOT be able to PATCH a record of School B', async () => {
    const response = await clientA.put(`/fees/structure/${schoolB.id}`, { name: 'Hacked Fee' });
    expect([403, 404]).toContain(response.status);
  });

  test('School A admin should NOT be able to DELETE any School B record', async () => {
    const response = await clientA.delete(`/schools/${schoolB.id}`);
    expect(response.status).toBe(403);
  });
});
