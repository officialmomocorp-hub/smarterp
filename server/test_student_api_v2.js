const prisma = require('./src/config/database');
async function run() {
  const user = await prisma.user.findFirst({ where: { phone: '9999999999' } });
  if (!user) { console.log('User not found'); return; }
  const studentData = await prisma.student.findFirst({
    where: { userId: user.id },
    include: {
      admission: { include: { profile: true } },
      class: true,
      section: true,
    }
  });
  if (!studentData) {
    console.log('STUDENT DATA NOT FOUND');
  } else {
    console.log('SUCCESS: Student Profile Found ->', studentData.admission?.profile?.firstName);
  }
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
