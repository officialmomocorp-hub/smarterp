const bcrypt = require('bcryptjs');
const prisma = require('./src/config/database');
async function run() {
  const user = await prisma.user.findFirst({ where: { phone: '9999999999' } });
  if (!user) { console.log('User not found'); return; }
  const match = await bcrypt.compare('admin123', user.password);
  console.log('Password Match for admin123:', match);
  if (!match) {
    const hashed = await bcrypt.hash('admin123', 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    console.log('Password reset to admin123');
  }
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
