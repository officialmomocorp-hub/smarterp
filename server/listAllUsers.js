const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany().then(users => {
  users.forEach(u => console.log(`${u.email} - ${u.role}`));
}).catch(console.error).finally(()=>prisma.$disconnect());
