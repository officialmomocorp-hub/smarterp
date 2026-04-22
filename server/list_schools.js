const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const schools = await prisma.school.findMany();
  console.log('--- SCHOOLS ---');
  schools.forEach(s => console.log(`${s.id}: ${s.name}`));
  process.exit(0);
}

run();
