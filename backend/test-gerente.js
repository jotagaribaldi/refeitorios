const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { sub: 'd5850e2a-a023-4fca-b56e-98028234b142', email: 'pauloneto@tonolucro.com.br', role: 'GERENTE', tenantId: '39f43acc-7e4d-43ac-a983-00ebccfcea1d' },
  'refeitorios_super_secret_jwt_2026',
  { expiresIn: '7d' }
);
console.log(token);
