import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 VUs
    { duration: '1m', target: 50 },  // Maintain at 50 concurrent users
    { duration: '30s', target: 0 },  // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'https://smarterpsolution.duckdns.org/api/v1';

export default function () {
  // Use environment variables for credentials or default to seed admin
  const email = __ENV.ADMIN_EMAIL || 'admin@smarterp.in';
  const password = __ENV.ADMIN_PASSWORD || 'admin123';

  const loginPayload = JSON.stringify({
    emailOrPhone: email,
    password: password,
  });

  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const loginOk = check(loginRes, {
    'Auth: Login success': (r) => r.status === 200,
  });

  if (!loginOk) return;

  const token = loginRes.json('data.token');
  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // 1. Fetch Student Directory (Most common operation)
  const studentsRes = http.get(`${BASE_URL}/students?limit=20`, params);
  check(studentsRes, {
    'Read: Get student list 200': (r) => r.status === 200,
    'Read: Found data': (r) => r.json('data') !== undefined,
  });

  // 2. Simulate School Admin looking at Fee Ledger
  const feesRes = http.get(`${BASE_URL}/fees?status=PENDING`, params);
  check(feesRes, {
    'Read: Get fee ledger 200': (r) => r.status === 200,
  });

  // 3. Constant Token refresh check/Auth Profile
  const profileRes = http.get(`${BASE_URL}/auth/profile`, params);
  check(profileRes, {
    'Security: Token valid': (r) => r.status === 200,
  });

  // 4. (Randomized) - Check for recent Admissions
  if (Math.random() > 0.5) {
     const admissionsRes = http.get(`${BASE_URL}/admissions?status=PENDING`, params);
     check(admissionsRes, {
       'Read: Admissions lookup 200': (r) => r.status === 200,
     });
  }

  sleep(Math.random() * 2 + 1); // Random think-time between 1 and 3 seconds
}
