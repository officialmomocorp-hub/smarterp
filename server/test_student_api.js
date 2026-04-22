const prisma = require('./src/config/database');
async function run() {
  try {
    const student = await prisma.student.findFirst({
      where: { phone: '9999999999' }, // This won't work, need userId
    });
    const user = await prisma.user.findFirst({ where: { phone: '9999999999' } });
    if (!user) { console.log('User not found'); process.exit(1); }
    
    // Simulating the dashboard route logic
    const studentData = await prisma.student.findFirst({
      where: { userId: user.id },
      include: {
        admission: { include: { profile: true } },
        class: true,
        section: true,
      }
    });

    if (!studentData) {
      console.log('STUDENT DATA NOT FOUND for user', user.id);
    } else {
      console.log('SUCCESS: Student Profile Found ->', studentData.admission?.profile?.firstName);
      console.log('Class:', studentData.class?.name);
    }
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.\();
  }
}
run();
