const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAll() {
    try {
        const schools = await prisma.school.findMany({
            take: 5,
            select: { id: true, name: true, isActive: true }
        });
        console.log(JSON.stringify(schools, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

listAll();
