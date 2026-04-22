const { getToken, getClient, createTestSchool, deleteTestSchool } = require('../isolation/setup');

describe('Tier 2: Fee Management - Race Condition & Locking', () => {
  let superAdminToken;
  let adminToken;
  let client;
  let school;
  let studentId;
  let feeStructureId;

  beforeAll(async () => {
    superAdminToken = await getToken('admin@smarterp.in', 'admin123');
    school = await createTestSchool(superAdminToken, 'Race Condition Test School');
    adminToken = await getToken(school.adminEmail, school.adminPassword);
    client = getClient(adminToken);

    // Setup student/fee
    const classRes = await client.post('/academic/classes', {
      name: 'Class 1',
      displayName: 'Class 1-A',
      sortOrder: 1,
      sections: [{ name: 'A', capacity: 40 }]
    });
    
    const studentRes = await client.post('/students', {
      firstName: 'Race',
      lastName: 'Student',
      class: 'Class 1',
      section: 'A',
      parentData: { fatherName: 'RaceFather', fatherPhone: '9111111111' }
    });
    studentId = studentRes.data.data.id;

    const feeStructRes = await client.post('/fees/structure', {
      classId: classRes.data.data.id,
      name: 'Monthly Fee',
      feeHeads: [{ name: 'Tuition', amount: 5000 }],
      installmentType: 'MONTHLY',
      dueDates: [{ installment: 1, amount: 5000, date: '2025-04-30' }]
    });
    feeStructureId = feeStructRes.data.data.id;
  });

  afterAll(async () => {
    if (school?.id) {
       await deleteTestSchool(superAdminToken, school.id);
    }
  });

  test('Race Condition: Concurrent payment requests should be atomic', async () => {
    const paymentData = {
      studentId: studentId,
      feeStructureId: feeStructureId,
      installmentNumber: 1,
      amount: 5000,
      paymentMode: 'ONLINE',
      transactionId: 'TXN_CONC_1'
    };

    // Fire two identical requests simultaneously
    const [res1, res2] = await Promise.all([
      client.post('/fees/payment', paymentData).catch(e => e.response),
      client.post('/fees/payment', paymentData).catch(e => e.response)
    ]);

    console.log('Concurrent Statuses:', res1.status, res2.status);

    // Expectation: Only ONE should succeed if correctly locked.
    // If both 201, it's a double payment bug.
    const statuses = [res1.status, res2.status];
    const successes = statuses.filter(s => s === 201).length;

    expect(successes).toBe(1);
  });
});
