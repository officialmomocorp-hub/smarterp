const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({
    where: { email: 'info@dpsdemo.edu.in' }
  });
  console.log('--- USER AUDIT ---');
  console.log('User Found:', !!user);
  if (user) {
    console.log('User Role:', user.role);
    console.log('User School ID:', user.schoolId);
  }
  process.exit(0);
}

check();
