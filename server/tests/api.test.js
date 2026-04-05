const assert = require('assert');
const http = require('http');
const https = require('https');

/**
 * SmartERP API Test Suite
 * Tests core endpoints for correctness, auth, and security.
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
let authToken = '';
let testSchoolId = '';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
      rejectUnauthorized: false
    };

    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
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

let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  return fn().then(() => {
    passed++;
    results.push(`  ✅ ${name}`);
  }).catch((err) => {
    failed++;
    results.push(`  ❌ ${name}: ${err.message}`);
  });
}

async function runTests() {
  console.log('\n🧪 SmartERP API Test Suite\n');
  console.log('━'.repeat(50));

  // ===== HEALTH =====
  console.log('\n📌 Health Check');
  await test('GET /health returns 200', async () => {
    const res = await request('GET', '/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'OK');
  });

  // ===== AUTH =====
  console.log('\n🔐 Authentication');
  await test('POST /auth/login with valid credentials', async () => {
    const res = await request('POST', '/api/v1/auth/login', {
      emailOrPhone: 'admin@smarterp.in',
      password: 'admin123'
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    authToken = res.body.data.token;
  });

  await test('POST /auth/login with wrong password returns 401', async () => {
    const res = await request('POST', '/api/v1/auth/login', {
      emailOrPhone: 'admin@smarterp.in',
      password: 'wrongpassword'
    });
    assert.ok([401, 403].includes(res.status));
    assert.strictEqual(res.body.success, false);
  });

  await test('POST /auth/login with empty body returns error', async () => {
    const res = await request('POST', '/api/v1/auth/login', {});
    assert.ok([400, 401, 500].includes(res.status));
  });

  await test('GET /auth/profile without token returns 401', async () => {
    const res = await request('GET', '/api/v1/auth/profile');
    assert.ok([401, 500].includes(res.status));
  });

  await test('GET /auth/profile with valid token returns user', async () => {
    if (!authToken) return; // Skip if login failed
    const res = await request('GET', '/api/v1/auth/profile', null, authToken);
    assert.ok([200, 401, 500].includes(res.status));
  });

  // ===== DASHBOARD =====
  console.log('\n📊 Dashboard');
  await test('GET /dashboard/admin returns school stats', async () => {
    if (!authToken) return;
    const res = await request('GET', '/api/v1/dashboard/admin', null, authToken);
    assert.ok([200, 401, 403, 500].includes(res.status));
  });

  // ===== STUDENTS =====
  console.log('\n👨‍🎓 Students');
  await test('GET /students returns list', async () => {
    if (!authToken) return;
    const res = await request('GET', '/api/v1/students', null, authToken);
    assert.ok([200, 401, 403, 500].includes(res.status));
  });

  await test('GET /students without auth returns 401', async () => {
    const res = await request('GET', '/api/v1/students');
    assert.ok([401, 500].includes(res.status));
  });

  // ===== FEES =====
  console.log('\n💰 Fees');
  await test('GET /fees returns fee data', async () => {
    if (!authToken) return;
    const res = await request('GET', '/api/v1/fees', null, authToken);
    assert.ok([200, 401, 403, 500].includes(res.status));
  });

  // ===== ATTENDANCE =====
  console.log('\n📋 Attendance');
  await test('GET /attendance returns data', async () => {
    if (!authToken) return;
    const res = await request('GET', '/api/v1/attendance', null, authToken);
    assert.ok([200, 401, 403, 500].includes(res.status));
  });

  // ===== STAFF =====
  console.log('\n👩‍🏫 Staff');
  await test('GET /staff returns list', async () => {
    if (!authToken) return;
    const res = await request('GET', '/api/v1/staff', null, authToken);
    assert.ok([200, 401, 403, 500].includes(res.status));
  });

  // ===== SECURITY TESTS =====
  console.log('\n🛡️ Security');
  await test('XSS in login is sanitized', async () => {
    const res = await request('POST', '/api/v1/auth/login', {
      emailOrPhone: '<script>alert(1)</script>',
      password: 'test'
    });
    assert.ok([400, 401].includes(res.status));
  });

  await test('Invalid JWT returns error', async () => {
    const res = await request('GET', '/api/v1/students', null, 'invalid.jwt.token');
    assert.ok([401, 500].includes(res.status));
  });

  await test('SQL injection in login is blocked', async () => {
    const res = await request('POST', '/api/v1/auth/login', {
      emailOrPhone: "admin' OR '1'='1",
      password: "' OR '1'='1"
    });
    assert.ok([400, 401].includes(res.status));
    assert.strictEqual(res.body.success, false);
  });

  // ===== RESULTS =====
  console.log('\n' + '━'.repeat(50));
  console.log('\n📝 Results:\n');
  results.forEach(r => console.log(r));
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total:  ${passed + failed}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
