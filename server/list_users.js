const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, schoolId: true }
  });
  console.log('--- ALL USERS ---');
  users.forEach(u => console.log(`${u.email} (${u.role}) - School: ${u.schoolId}`));
  process.exit(0);
}

check();
