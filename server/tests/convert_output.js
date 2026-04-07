const fs = require('fs');
const b = fs.readFileSync('tests/verification_output.txt');
const t = b.toString('utf16le');
// Write as UTF-8
fs.writeFileSync('tests/verification_utf8.txt', t, 'utf8');
console.log(t);
