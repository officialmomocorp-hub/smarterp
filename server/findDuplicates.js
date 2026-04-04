const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const dups = await prisma.$queryRaw`
        SELECT "classId", "sectionId", "academicYearId", "rollNumber"
        FROM "Student"
        GROUP BY "classId", "sectionId", "academicYearId", "rollNumber"
        HAVING count(*) > 1;
    `;
    console.log('Duplicates found:', dups);
}
main().catch(console.error).finally(()=>prisma.$disconnect());
