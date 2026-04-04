const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.school.findMany({ include: { admin: true } }).then(schools => {
  schools.forEach(s => console.log(`${s.name} - ${s.admin?.email}`));
}).catch(console.error).finally(()=>prisma.$disconnect());
