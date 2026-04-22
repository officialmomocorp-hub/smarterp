const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const totalCount = await prisma.libraryBook.count();
    console.log('--- DATABASE AUDIT ---');
    console.log('Total Books in System:', totalCount);
    
    const schoolsWithBooks = await prisma.libraryBook.groupBy({
      by: ['schoolId'],
      _count: { id: true }
    });
    console.log('Schools with books:', JSON.stringify(schoolsWithBooks, null, 2));
    
    // Check specific school dps-demo
    const dpsBooks = await prisma.libraryBook.count({ where: { schoolId: 'dps-demo' } });
    console.log('Books in dps-demo (School Admin):', dpsBooks);

    process.exit(0);
  } catch (e) {
    console.error('Audit failed:', e);
    process.exit(1);
  }
}

check();
