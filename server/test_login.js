
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const email = 'admin@smarterp.in';
    const pass = 'Bkb@1234';
    
    const user = await prisma.user.findFirst({
      where: { email }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('User found:', user.email);
    console.log('Hash in DB:', user.password);
    
    const isMatch = await bcrypt.compare(pass, user.password);
    console.log('Matches:', isMatch);
    console.log('isActive:', user.isActive);
  } catch (e) {
    console.error('Error in test:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();

