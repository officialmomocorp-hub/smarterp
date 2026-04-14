const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteTest() {
    const schoolId = '4946ce82-c6f7-4b34-8b39-a945f3b55579';
    console.log('Attempting to delete school:', schoolId);
    try {
        const deleted = await prisma.school.delete({
            where: { id: schoolId }
        });
        console.log('Successfully deleted school:', deleted.name);
    } catch (e) {
        console.error('DELETE ERROR:', e);
        if (e.code === 'P2003') {
            console.error('Foreign key constraint failed on field:', e.meta.field_name);
        }
    } finally {
        await prisma.$disconnect();
    }
}

deleteTest();
