const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findInactiveSchools() {
    try {
        const schools = await prisma.school.findMany({
            where: { isActive: false },
            select: { id: true, name: true, code: true }
        });
        console.log('START_JSON');
        console.log(JSON.stringify(schools, null, 2));
        console.log('END_JSON');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

findInactiveSchools();
