const https = require('https');

const BASE_URL = 'https://smarterpsolution.duckdns.org';

const admin = { role: 'ADMIN', emailOrPhone: 'admin@smarterp.in', password: 'admin123' };
const others = [
  { role: 'TEACHER', emailOrPhone: 'teacher@smarterp.in', password: 'admin123' },
  { role: 'STUDENT', emailOrPhone: '9999999999', password: 'admin123' },
  { role: 'PARENT', emailOrPhone: '9888888888', password: 'admin123' },
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
          resolve({ status: res.statusCode, body: JSON.parse(data) });
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

async function verifySync() {
  console.log('=== CROSS-ROLE SYNC VERIFICATION ===\n');

  try {
    // 1. Login as Admin
    console.log('1. Logging in as ADMIN...');
    const adminLogin = await request('POST', '/api/v1/auth/login', admin);
    const adminToken = adminLogin.body.data.token;

    // 2. Admin Creates a Notice
    const syncTitle = `Sync-Test-${Date.now()}`;
    console.log(`2. Creating Notice: "${syncTitle}"...`);
    const createRes = await request('POST', '/api/v1/notices', {
      title: syncTitle,
      content: 'Verification of cross-role data synchronization.',
      target: 'ALL',
      priority: 'HIGH'
    }, adminToken);

    if (createRes.status === 201) {
      console.log('   ✅ Notice created successfully.\n');
    } else {
      throw new Error(`Failed to create notice: ${JSON.stringify(createRes.body)}`);
    }

    // 3. Verify visibility for other roles
    for (const user of others) {
      console.log(`3. Verifying visibility for ${user.role}...`);
      await new Promise(r => setTimeout(r, 2000)); // Delay to avoid 429
      
      const loginRes = await request('POST', '/api/v1/auth/login', user);
      if (loginRes.status !== 200) {
        console.log(`   ❌ Login FAILED for ${user.role} (${loginRes.status})`);
        continue;
      }
      const token = loginRes.body.data.token;

      const noticeRes = await request('GET', '/api/v1/notices', null, token);
      const found = noticeRes.body.data.some(n => n.title === syncTitle);
      
      if (found) {
        console.log(`   ✅ SUCCESS: ${user.role} can see the new notice.\n`);
      } else {
        console.log(`   ❌ FAILURE: ${user.role} cannot see the notice.\n`);
      }
    }

  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
  }
  console.log('Verification Complete.');
}

verifySync();
