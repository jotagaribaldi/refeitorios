const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { sub: '01c67585-01cd-45dc-864e-f1a2a9a2e121', email: 'mariza@suprema.eti.br', role: 'FISCAL', tenantId: 'f3ef80b5-9755-454f-b8ac-a34e8745e6c2' },
  'refeitorios_super_secret_jwt_2026',
  { expiresIn: '7d' }
);
console.log(token);
