const axios = require('axios');

async function auditWebSecurity() {
  const url = 'https://smarterpsolution.duckdns.org/';
  console.log(`--- Auditing Security Configurations for ${url} ---`);

  try {
    const res = await axios.get(url);
    const headers = res.headers;

    const securityHeaders = [
      'content-security-policy',
      'strict-transport-security',
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'referrer-policy',
      'permissions-policy'
    ];

    console.log('\n[Phase 4: Security Misconfiguration Check]');
    securityHeaders.forEach(header => {
      if (headers[header]) {
        console.log(`✅ ${header}: ${headers[header]}`);
      } else {
        console.log(`❌ ${header}: MISSING`);
      }
    });

    console.log('\n[Phase 15: Advanced Misconfigurations - CORS]');
    // Note: To check CORS properly we need to send an OPTIONS request or an Origin header
    try {
      const corsRes = await axios.options(url, {
         headers: { 'Origin': 'https://evil.com', 'Access-Control-Request-Method': 'GET' }
      });
      console.log(`❕ Access-Control-Allow-Origin: ${corsRes.headers['access-control-allow-origin'] || 'NONE (Strict)'}`);
    } catch (e) {
      console.log('✅ CORS is strict (Request Blocked/Rejected for untrusted origin)');
    }

    console.log('\n[Phase 2: Authentication Security - Cookie Flags]');
    // Audit the login response cookies
    try {
      const loginRes = await axios.post('https://smarterpsolution.duckdns.org/api/v1/auth/login', {
         emailOrPhone: 'admin@smarterp.in', password: 'admin123'
      });
      
      const cookies = loginRes.headers['set-cookie'];
      if (cookies) {
        cookies.forEach(c => {
          console.log(`Cookie: ${c}`);
          if (c.includes('HttpOnly')) console.log('  ✅ HttpOnly: YES');
          else console.log('  ❌ HttpOnly: MISSING');
          
          if (c.includes('Secure')) console.log('  ✅ Secure: YES');
          else console.log('  ❌ Secure: MISSING');
          
          if (c.includes('SameSite=Strict')) console.log('  ✅ SameSite: Strict');
          else if (c.includes('SameSite=Lax')) console.log('  ⚠️ SameSite: Lax (Acceptable)');
          else console.log('  ❌ SameSite: MISSING');
        });
      } else {
        console.log('⚠️ No Set-Cookie headers returned. Check login success.');
      }
    } catch (e) {
      console.log(`❌ Login Audit Failed: ${e.message}`);
      if (e.response) console.log(`   Response: ${JSON.stringify(e.response.data)}`);
    }

  } catch (err) {
    console.error('Audit failed:', err.message);
  }
}

auditWebSecurity();
