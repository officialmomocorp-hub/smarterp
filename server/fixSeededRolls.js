const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    // Increment roll number for all "StudentX" students
    const students = await prisma.student.findMany({
        where: { profile: { firstName: { startsWith: 'Student' } } },
        orderBy: { rollNumber: 'desc' }
    });
    for (const student of students) {
        await prisma.student.update({
            where: { id: student.id },
            data: { rollNumber: student.rollNumber + 1 }
        });
    }
    console.log('Fixed seeded students roll numbers.');
}
main().catch(console.error).finally(()=>prisma.$disconnect());
