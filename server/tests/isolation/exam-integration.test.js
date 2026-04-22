const { getToken, getClient, createTestSchool, deleteTestSchool } = require('./setup');

describe('Exam API Integration Tests', () => {
  let superAdminToken;
  let adminToken;
  let school;
  let client;

  beforeAll(async () => {
    superAdminToken = await getToken('admin@smarterp.in', 'admin123');
    school = await createTestSchool(superAdminToken, 'TDD Test School Exam');
    adminToken = await getToken(school.adminEmail, school.adminPassword);
    client = getClient(adminToken);
  });

  afterAll(async () => {
    if (school && school.id) {
      await deleteTestSchool(superAdminToken, school.id);
    }
  });

  test('Fetching exams for the school should return a successful response', async () => {
    const response = await client.get('/exams');
    expect(response.status).toBe(200);
    // Even if empty, it should be an array or object wrapping an array
    expect(response.data).toBeDefined();
  });

  test('Creating an exam without a required name should fail (400) - Checking Joi Validation', async () => {
    const response = await client.post('/exams', {
      type: 'TERM_1', // Missing 'name' based on typical schema requirements
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString()
    });

    expect(response.status).toBe(400); // Expecting Bad Request due to validation
  });
});
