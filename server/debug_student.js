const prisma = require('./src/config/database');
async function run() {
  try {
    const user = await prisma.user.findFirst({
      where: { phone: '9999999999' },
      include: { student: true }
    });
    console.log(JSON.stringify(user, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.\();
  }
}
run();
