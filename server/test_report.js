
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: { students: true, staff: true, users: true }
        }
      }
    });
    console.log('Success:', schools.length, 'schools found');
    process.exit(0);
  } catch (e) {
    console.error('Failed:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
main();
