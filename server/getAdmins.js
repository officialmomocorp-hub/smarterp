const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany({ where: { role: 'ADMIN' }}).then(console.log).catch(console.error).finally(()=>prisma.$disconnect());
