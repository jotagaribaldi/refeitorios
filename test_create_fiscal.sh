TOKEN=$(curl -s -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"root@refeitorios.com","password":"Tocantins#159"}' | grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$')

echo "Token: $TOKEN"

curl -v -X POST http://localhost:3003/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Fiscal",
    "email": "fiscal2@test.com",
    "password": "password123",
    "role": "FISCAL"
  }'
