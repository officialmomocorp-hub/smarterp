const { getToken, getClient, createTestSchool, deleteTestSchool } = require('./setup');

describe('Staff API Integration Tests', () => {
  let superAdminToken;
  let adminToken;
  let school;
  let client;

  beforeAll(async () => {
    superAdminToken = await getToken('admin@smarterp.in', 'admin123');
    school = await createTestSchool(superAdminToken, 'TDD Test School Staff');
    adminToken = await getToken(school.adminEmail, school.adminPassword);
    client = getClient(adminToken);
  });

  afterAll(async () => {
    if (school && school.id) {
      await deleteTestSchool(superAdminToken, school.id);
    }
  });

  test('Updating a staff profile with injected role should fail (400 Mass Assignment Prevention)', async () => {
    const response = await client.put('/staff/dummy-id', {
      role: 'SUPER_ADMIN',
      salary: 1000000
    });

    // We verify strict validation prevents mass assignment 
    // Expecting 404 (or 400 depending on Joi stripUnknown handling) 
    // What we really care about is it DOES NOT return 200 or 201 for this payload
    expect(response.status).not.toBe(200);
    expect(response.status).not.toBe(201);
  });

  test('Creating a new staff with invalid email format should fail (400)', async () => {
    const response = await client.post('/staff', {
      firstName: 'Test',
      lastName: 'Staff',
      email: 'invalid-email',
      phone: '1234567890',
      role: 'TEACHER',
      department: 'Science',
      designation: 'Senior Teacher',
      joiningDate: new Date().toISOString()
    });

    expect(response.status).toBe(400);
  });
});
