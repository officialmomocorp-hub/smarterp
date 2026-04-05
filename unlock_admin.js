const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@smarterp.in';
  console.log(`Unlocking account: ${email}`);
  
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    console.log('User not found!');
    return;
  }
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      isActive: true
    }
  });
  
  console.log('Account UNLOCKED successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
