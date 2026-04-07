const { getToken, getClient } = require('./setup');

describe('JWT Integrity & Role Security (Production)', () => {
  let teacherToken;
  let clientTeacher;

  beforeAll(async () => {
    teacherToken = await getToken('teacher@smarterp.in', 'admin123');
    clientTeacher = getClient(teacherToken);
  });

  test('Completely fake token returns 401', async () => {
    const client = getClient('invalid_token_xyz');
    const response = await client.get('/auth/profile');
    expect(response.status).toBe(401);
  });

  test('Tampered role claim in token results in failure', async () => {
    const parts = teacherToken.split('.');
    if (parts.length === 3) {
      const tamperedPayload = Buffer.from(parts[1], 'base64').toString();
      const hackedPayload = tamperedPayload.replace('"role":"TEACHER"', '"role":"ADMIN"');
      const b64Hacked = Buffer.from(hackedPayload).toString('base64').replace(/=/g, '');
      const hackedToken = `${parts[0]}.${b64Hacked}.${parts[2]}`;

      const client = getClient(hackedToken);
      const response = await client.get('/auth/profile');
      expect(response.status).toBe(401); 
    }
  });

  test('Teacher token cannot access SUPER_ADMIN only route', async () => {
    const response = await clientTeacher.post('/schools', { name: 'Hacked School', code: 'HACK' });
    expect(response.status).toBe(403);
  });

  test('Teacher token cannot access admin only reports route', async () => {
    const response = await clientTeacher.get('/platform/reports/usage');
    expect(response.status).toBe(403);
  });

  test('Missing Authorization header returns 401', async () => {
    const client = getClient();
    const response = await client.get('/students');
    expect(response.status).toBe(401);
  });
});
