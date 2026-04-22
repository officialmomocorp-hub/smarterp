const { getToken, getClient, createTestSchool, deleteTestSchool } = require('../isolation/setup');

describe('Tier 2: Fee Management - Calculation & Stacking (Production)', () => {
  let superAdminToken;
  let adminToken;
  let client;
  let school;
  let studentId;
  let feeStructureId;
  let siblingConcessionId;
  let meritConcessionId;

  beforeAll(async () => {
    superAdminToken = await getToken('admin@smarterp.in', 'admin123');
    
    // Create fresh school for Tier 2
    console.log('Setup: Creating Tier 2 Test School...');
    school = await createTestSchool(superAdminToken, 'Tier 2 Fee Test School');
    adminToken = await getToken(school.adminEmail, school.adminPassword);
    client = getClient(adminToken);

    // 1. Create Academic Year (Already created by createSchool controller in some versions, but let's check)
    // The createSchool controller creates '2025-2026' automatically.

    // 2. Create a Class
    const classRes = await client.post('/academic/classes', {
      name: 'Class 10',
      displayName: 'Class 10-A',
      sortOrder: 10,
      sections: [{ name: 'A', capacity: 40 }]
    });
    const classId = classRes.data.data.id;

    // 3. Create Student
    const studentRes = await client.post('/students', {
      firstName: 'Audit',
      lastName: 'Student',
      class: 'Class 10',
      section: 'A',
      parentData: { fatherName: 'Father', fatherPhone: '9000000000' }
    });
    studentId = studentRes.data.data.id;

    // 4. Create Fee Structure
    const feeStructRes = await client.post('/fees/structure', {
      classId: classId,
      name: 'Annual Fee 2025',
      feeHeads: [{ name: 'Tuition', amount: 10000 }],
      installmentType: 'ANNUAL',
      dueDates: [{ installment: 1, amount: 10000, date: '2025-12-31' }]
    });
    feeStructureId = feeStructRes.data.data.id;

    // 5. Create Concessions
    const sibRes = await client.post('/fees/concession', {
      feeStructureId,
      name: 'Sibling Discount',
      type: 'SIBLING',
      discountType: 'PERCENTAGE',
      discountValue: 10
    });
    siblingConcessionId = sibRes.data.data.id;

    const meritRes = await client.post('/fees/concession', {
      feeStructureId,
      name: 'Merit Scholarship',
      type: 'MERIT',
      discountType: 'FIXED',
      discountValue: 1000
    });
    meritConcessionId = meritRes.data.data.id;
  });

  afterAll(async () => {
    if (school?.id) {
       await deleteTestSchool(superAdminToken, school.id);
    }
  });

  test('Calculation: Single Concession (Percentage)', async () => {
    const response = await client.post('/fees/payment', {
      studentId: studentId,
      feeStructureId: feeStructureId,
      installmentNumber: 1,
      amount: 9000,
      concessionId: siblingConcessionId,
      paymentMode: 'CASH'
    });

    expect(response.status).toBe(201);
    expect(parseFloat(response.data.data.concessionAmount)).toBe(1000); // 10% of 10000
    expect(parseFloat(response.data.data.paidAmount)).toBe(9000);
    expect(response.data.data.status).toBe('PAID');
  });

  test('Stacking: Attempting multiple concessions (Requirement Check)', async () => {
    // Current API only takes one concessionId.
    // Testing if passing an array or multiple results in error or correct stacking
    const response = await client.post('/fees/payment', {
      studentId: studentId,
      feeStructureId: feeStructureId,
      installmentNumber: 2, // Second installment or new student logic
      amount: 8000,
      concessionIds: [siblingConcessionId, meritConcessionId], // Hypothetical multi-concession
      paymentMode: 'CASH'
    });

    // If it fails or ignores the array, it proves stacking isn't implemented.
    // Expected behavior for "fully automated" requirement is that it should pass if we implement it.
    console.log('Stacking Response:', response.status, response.data);
  });

  test('Immutability: Paid fee should not allow additional payments for same installment', async () => {
     // Installment 1 is already PAID from first test.
     const response = await client.post('/fees/payment', {
        studentId: studentId,
        feeStructureId: feeStructureId,
        installmentNumber: 1,
        amount: 1000,
        paymentMode: 'CASH'
     });

     // Should return 400 or ignore if strictly immutable
     expect(response.status).not.toBe(201);
  });
});
