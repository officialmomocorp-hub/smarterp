const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const roles = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'PARENT', 'STUDENT'];
  const results = {};
  for (const role of roles) {
    const user = await prisma.user.findFirst({
      where: { role, isActive: true },
      select: { email: true, phone: true, role: true }
    });
    results[role] = user;
  }
  console.log(JSON.stringify(results, null, 2));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
