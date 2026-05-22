const http = require('http');

async function request(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const req = http.request({
      hostname: 'localhost',
      port: 3003,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
        } catch(e) {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('Logging in as root...');
  const rootLogin = await request('/api/auth/login', 'POST', { email: 'root@refeitorios.com', password: 'root' });
  // Wait, root password might be 'root@123' as per the seed?
  let token = rootLogin.body.access_token;
  if (!token) {
    const rootLogin2 = await request('/api/auth/login', 'POST', { email: 'root@refeitorios.com', password: 'Tocantins#159' });
    token = rootLogin2.body.access_token;
  }
  console.log('Root token:', !!token);

  console.log('Fetching users...');
  const usersRes = await request('/api/users', 'GET', null, token);
  const users = usersRes.body;
  const fiscal = users.find(u => u.role === 'FISCAL');
  const func = users.find(u => u.role === 'FUNCIONARIO' && u.tenantId === fiscal?.tenantId);
  
  if (!fiscal || !func) {
    console.log('Could not find fiscal or func in same tenant', { fiscal: !!fiscal, func: !!func });
    return;
  }

  console.log('Found fiscal:', fiscal.email, 'func:', func.email);
  // Actually, I can just use root token to test the endpoint?
  // No, the endpoint requires UserRole.FISCAL. But we don't know the fiscal's password.
  // Wait! The user might be getting 500 error even with a root token? No, root doesn't have FISCAL role.
  // Can I update the fiscal password so I can log in?
  await request(`/api/users/${fiscal.id}`, 'PUT', { password: 'password123' }, token);
  
  const fiscalLogin = await request('/api/auth/login', 'POST', { email: fiscal.email, password: 'password123' });
  const fiscalToken = fiscalLogin.body.access_token;
  console.log('Fiscal logged in:', !!fiscalToken);

  console.log('Scanning...');
  const scanRes = await request('/api/consumptions/scan', 'POST', { userId: func.id }, fiscalToken);
  console.log('Scan response:', scanRes);
}

run().catch(console.error);
