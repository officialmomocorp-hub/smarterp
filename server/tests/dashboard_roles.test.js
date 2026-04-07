const https = require('https');

const BASE_URL = 'https://smarterpsolution.duckdns.org';

const rolesToTest = [
  { role: 'TEACHER', creds: { emailOrPhone: 'teacher@smarterp.in', password: 'admin123' }, endpoint: '/api/v1/dashboard/teacher' },
  { role: 'STUDENT', creds: { emailOrPhone: '9999999999', password: 'admin123' }, endpoint: '/api/v1/dashboard/student' },
  { role: 'PARENT', creds: { emailOrPhone: '9888888888', password: 'admin123' }, endpoint: '/api/v1/dashboard/parent' },
];

async function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('=== ROLE-BASED DASHBOARD PRODUCTION VERIFICATION ===');
  console.log(`Target: ${BASE_URL}\n`);

  for (const testCase of rolesToTest) {
    process.stdout.write(`Testing role: ${testCase.role}... `);
    try {
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000));

      // 1. Login
      const loginRes = await request('POST', '/api/v1/auth/login', testCase.creds);
      if (loginRes.status !== 200 || !loginRes.body?.data?.token) {
        console.log(`❌ Login FAILED (Status: ${loginRes.status}, Body: ${JSON.stringify(loginRes.body)})`);
        continue;
      }
      const token = loginRes.body.data.token;

      // 2. Fetch Dashboard
      const dashRes = await request('GET', testCase.endpoint, null, token);
      if (dashRes.status === 200 && dashRes.body?.success) {
        console.log(`✅ OK (200)`);
      } else {
        console.log(`❌ FAILED (Status: ${dashRes.status}, Msg: ${dashRes.body?.message || 'Unknown'})`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
  }
  console.log('\nVerification Complete.');
}

runTests();
