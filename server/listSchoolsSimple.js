const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.school.findMany().then(schools => {
  console.log(JSON.stringify(schools, null, 2));
}).catch(console.error).finally(()=>prisma.$disconnect());
