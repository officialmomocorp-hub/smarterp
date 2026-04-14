
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });
  console.log(Buffer.from(JSON.stringify(user)).toString('base64'));
}
main().catch(console.error).finally(() => prisma.$disconnect());
