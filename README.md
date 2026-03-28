# 🍽️ Sistema de Refeitórios Corporativos

Sistema SaaS multi-tenant para gestão de refeitórios com controle via QR Code.

---

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+ (ou Docker)
- npm

### 1. Clonando / iniciando

Se já está na pasta do projeto, basta seguir os passos abaixo.

---

## 🗄️ Banco de Dados

### Opção A — PostgreSQL local
1. Crie o banco:
```bash
createdb refeitorios
```
2. Configure o `.env` em `backend/` com suas credenciais.

### Opção B — Docker (recomendado)
```bash
# Somente o banco de dados
docker run -d \
  --name refeitorios_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=refeitorios \
  -p 5432:5432 \
  postgres:16-alpine
```

---

## ⚙️ Backend (NestJS)

```bash
cd backend

# Copie e edite o .env se necessário
# (já pré-configurado com postgres local)

# Iniciar em modo desenvolvimento
npm run start:dev
```

A API estará disponível em: **http://localhost:3000/api**

> ✅ O usuário ROOT é criado automaticamente na primeira execução:
> - Email: `root@refeitorios.com`
> - Senha: `root@123`

---

## 🌐 Frontend (React + Vite)

### Correção necessária (Linux — inotify limit)
Execute **uma vez** no terminal:
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

Depois:
```bash
cd frontend
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

---

## 🐳 Docker Compose (Produção)

```bash
# Na raiz do projeto
docker-compose up -d
```

Serviços:
- PostgreSQL: `localhost:5432`
- Backend API: `localhost:3000`
- Frontend Web: `localhost:80`

---

## 📌 Endpoints da API

| Método | Rota | Descrição | Roles |
|--------|------|-----------|-------|
| POST | `/api/auth/login` | Login | Todos |
| GET | `/api/tenants` | Listar empresas | ROOT |
| POST | `/api/tenants` | Criar empresa | ROOT |
| GET | `/api/restaurants` | Listar refeitórios | ROOT, GERENTE |
| POST | `/api/restaurants` | Criar refeitório | ROOT, GERENTE |
| GET | `/api/restaurants/:id/qrcode` | Obter QR Code | ROOT, GERENTE |
| POST | `/api/restaurants/:id/regenerate-qr` | Regenerar QR | ROOT, GERENTE |
| GET | `/api/users` | Listar usuários | ROOT, GERENTE |
| POST | `/api/users` | Criar usuário | ROOT, GERENTE |
| GET | `/api/allowances` | Listar saldos | ROOT, GERENTE |
| POST | `/api/allowances` | Criar saldo | ROOT, GERENTE |
| POST | `/api/consumptions` | Registrar consumo (QR) | FUNCIONARIO |
| GET | `/api/consumptions` | Listar consumos | ROOT, GERENTE |
| GET | `/api/consumptions/me` | Meus consumos | FUNCIONARIO |
| GET | `/api/meal-types` | Tipos de refeição | Todos |
| PUT | `/api/meal-types/time-windows` | Configurar horários | ROOT, GERENTE |
| GET | `/api/dashboard` | Dashboard gerencial | ROOT, GERENTE |

---

## 👥 Perfis de Usuário (RBAC)

| Role | Acesso |
|------|--------|
| **ROOT** | Gerencia empresas, refeitórios e gerentes |
| **GERENTE** | Gerencia funcionários, saldos e horários da sua empresa |
| **FUNCIONARIO** | Escaneia QR Code para registrar refeições |

---

## 🔄 Fluxo de Consumo

1. Funcionário faz login no app
2. Escaneia o QR Code do refeitório
3. Sistema valida:
   - ✅ QR Code válido e pertence ao tenant
   - ✅ Horário dentro da janela da refeição
   - ✅ Funcionário não consumiu este tipo hoje (se regra ativa)
   - ✅ Saldo mensal disponível
4. Consumo é registrado e saldo debitado
