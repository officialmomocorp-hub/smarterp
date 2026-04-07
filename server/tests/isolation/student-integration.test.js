const { getToken, getClient, createTestSchool, deleteTestSchool } = require('./setup');

describe('Student API Integration Tests', () => {
  let superAdminToken;
  let adminToken;
  let school;
  let client;
  let studentId;

  beforeAll(async () => {
    superAdminToken = await getToken('admin@smarterp.in', 'admin123');
    school = await createTestSchool(superAdminToken, 'TDD Test School Students');
    adminToken = await getToken(school.adminEmail, school.adminPassword);
    client = getClient(adminToken);
    
    // Setup a dummy student for update tests
    // Using a valid existing class ID (Class 1) or bypassing by just getting the list 
    // after running the seed (since seed has one demo student)
    // Actually our new school won't have students yet, so we test fetching empty
  });

  afterAll(async () => {
    if (school && school.id) {
      await deleteTestSchool(superAdminToken, school.id);
    }
  });

  test('Updating a student profile with invalid status should fail (400 Enum Validation)', async () => {
    const response = await client.put('/students/dummy-id', {
      status: 'HACKED',
      profile: {
        firstName: 'Test'
      }
    });

    // Should return 400 Validation Error before failing with 404 (Not Found)
    expect(response.status).toBe(400);
    expect(response.data.message).toBe('Validation failed');
  });
});
