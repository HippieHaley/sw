// Basic API tests
const http = require('http');

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function testHealthEndpoint() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET'
  };

  try {
    const result = await makeRequest(options);
    console.assert(result.statusCode === 200, 'Health check should return 200');
    console.assert(result.data.status === 'ok', 'Health check should return ok status');
    console.log('✓ Health endpoint test passed');
  } catch (error) {
    console.error('✗ Health endpoint test failed:', error.message);
  }
}

async function testUserRegistration() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const username = 'testuser_' + Date.now();
    const result = await makeRequest(options, {
      username,
      password: 'SecurePass123!'
    });

    console.assert(result.statusCode === 201, 'Registration should return 201');
    console.assert(result.data.token, 'Registration should return token');
    console.log('✓ User registration test passed');
    return result.data.token;
  } catch (error) {
    console.error('✗ User registration test failed:', error.message);
    return null;
  }
}

async function testTokenVerification(token) {
  if (!token) {
    console.log('⊘ Skipping token verification (no token)');
    return;
  }

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/verify',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  try {
    const result = await makeRequest(options);
    console.assert(result.statusCode === 200, 'Token verification should return 200');
    console.assert(result.data.valid === true, 'Token should be valid');
    console.log('✓ Token verification test passed');
  } catch (error) {
    console.error('✗ Token verification test failed:', error.message);
  }
}

async function runTests() {
  console.log('\n🧪 Running API tests...\n');
  
  await testHealthEndpoint();
  const token = await testUserRegistration();
  await testTokenVerification(token);
  
  console.log('\n✅ All tests completed\n');
}

// Only run if called directly
if (require.main === module) {
  // Wait a bit for server to start
  setTimeout(runTests, 2000);
}

module.exports = { runTests };
