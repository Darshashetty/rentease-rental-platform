// Test auth flow
import http from 'http';

const baseURL = 'http://localhost:5000/api';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseURL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testAuth() {
  console.log('=== Testing Auth Flow ===\n');

  try {
    // 1. Register
    console.log('1. Registering new user...');
    const regRes = await makeRequest('POST', '/auth/register', {
      name: 'Test User',
      email: `testuser${Date.now()}@example.com`,
      password: 'password123',
      role: 'tenant',
    });
    console.log(`   Status: ${regRes.status}`);
    console.log(`   Has token: ${!!regRes.body?.token}`);
    console.log(`   User: ${regRes.body?.user?.name}\n`);

    if (regRes.status !== 201 && regRes.status !== 200) {
      console.error('   ERROR: Registration failed', regRes.body);
      return;
    }

    const token = regRes.body?.token;
    const email = regRes.body?.user?.email;

    if (!token) {
      console.error('   ERROR: No token in registration response');
      return;
    }

    // 2. Login with the same credentials
    console.log('2. Logging in with same credentials...');
    const loginRes = await makeRequest('POST', '/auth/login', {
      email: email,
      password: 'password123',
    });
    console.log(`   Status: ${loginRes.status}`);
    console.log(`   Has token: ${!!loginRes.body?.token}`);
    console.log(`   User: ${loginRes.body?.user?.name}\n`);

    if (loginRes.status !== 200) {
      console.error('   ERROR: Login failed', loginRes.body);
      return;
    }

    const loginToken = loginRes.body?.token;

    // 3. Test protected route with token
    console.log('3. Testing protected route with token...');
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginToken}`,
      },
    };

    const protectedRes = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              body: data ? JSON.parse(data) : null,
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              body: data,
            });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    console.log(`   Status: ${protectedRes.status}`);
    console.log(`   Response type: ${Array.isArray(protectedRes.body) ? 'Array' : typeof protectedRes.body}\n`);

    if (protectedRes.status === 401) {
      console.error('   ✗ ERROR: 401 Unauthorized - token not working');
    } else if (protectedRes.status === 200) {
      console.log('   ✓ Token authentication works!');
    } else if (protectedRes.status === 403) {
      console.log('   ✓ Token is valid but user lacks permissions');
    } else {
      console.log(`   Status ${protectedRes.status} returned`);
    }

    console.log('\n=== Summary ===');
    console.log('✓ Registration works');
    console.log('✓ Login works');
    if (protectedRes.status === 200 || protectedRes.status === 403) {
      console.log('✓ Token-based requests work');
    }

  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

testAuth();
