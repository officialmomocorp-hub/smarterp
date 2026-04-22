const bcrypt = require('bcryptjs');

async function testHashing() {
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 12);
  console.log('Password:', password);
  console.log('Hashed:', hashed);
  const isValid = await bcrypt.compare(password, hashed);
  console.log('is Valid:', isValid);
}

testHashing();
