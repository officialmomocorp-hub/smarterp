
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.update({
    where: { email: 'superadmin@smarterp.com' },
    data: { password: hashedPassword }
  });
  console.log('Reset password for ' + user.email);
}
main().catch(console.error).finally(() => prisma.$disconnect());
