const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const students = await prisma.student.findMany({
        where: { rollNumber: 1 },
        include: { profile: { select: { firstName: true, lastName: true } }, class: { select: { name: true } }, section: { select: { name: true } } }
    });
    students.forEach(s => console.log(`${s.id}: ${s.profile?.firstName} ${s.profile?.lastName} - ${s.class?.name} ${s.section?.name} (Roll ${s.rollNumber})`));
}
main().catch(console.error).finally(()=>prisma.$disconnect());
