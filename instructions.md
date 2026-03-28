Você é um arquiteto de software sênior especializado em sistemas SaaS multi-tenant escaláveis.

Sua tarefa é projetar e implementar uma aplicação completa (backend + frontend + banco de dados) para gestão de refeitórios corporativos com controle de consumo de refeições via QR Code.

## 🧩 CONTEXTO DO SISTEMA

A aplicação será utilizada por múltiplas empresas (multi-tenant), onde cada empresa pode ter um ou mais refeitórios, usuários gerentes e funcionários.

O sistema deve controlar o consumo de refeições dos funcionários com base em regras de horário e saldo mensal.

---

## 🏗️ REQUISITOS DE ARQUITETURA

- Arquitetura SaaS multi-tenant (isolamento lógico por tenant_id)
- Backend: RESTful API (preferencialmente Node.js com NestJS ou Java com Spring Boot)
- Frontend: React (web admin) + opcional React Native (mobile)
- Banco de dados: PostgreSQL (vou te enviar os dados conexão com o servidor de banco)
- Autenticação: JWT + RBAC (Role-Based Access Control)
- Deploy: Docker + suporte a cloud (AWS/GCP/Azure)

---

## 👥 MODELO DE USUÁRIOS (RBAC)

### 1. ROOT (Super Admin)
- Cadastra empresas
- Cadastra refeitórios vinculados às empresas
- Cadastra usuários GERENTE vinculados à empresa e aos refeitórios

### 2. GERENTE
- Gerencia apenas dados da sua empresa (tenant isolado)
- Cadastra:
  - Refeitórios
  - Funcionários
- Define:
  - Limite mensal de refeições por funcionário
- Acompanha:
  - Dashboard com consumo por tipo de refeição e por período

### 3. FUNCIONÁRIO
- Possui login no sistema
- Acessa via smartphone
- Realiza leitura de QR Code para registrar consumo

---

## 🍽️ REGRAS DE NEGÓCIO

### Tipos de refeições (fixos):
- Café da manhã
- Almoço
- Lanche da tarde
- Jantar
- Lanche da noite

### Regras:
- Cada tipo de refeição possui uma faixa de horário configurável
- O sistema deve validar:
  - Se o horário atual está dentro da faixa permitida
  - Se o usuário ainda possui saldo disponível
  - Se o usuário já consumiu aquela refeição no dia (opcional: 1 por tipo/dia)

### Exemplo:
- Café da manhã: 06:00 - 09:00
- Almoço: 11:00 - 14:00

### Restrições:
- Não permitir consumo fora do horário
- Não permitir consumo com saldo zerado
- Não permitir duplicidade de consumo por tipo no mesmo dia (se regra ativada)

---

## 💰 CONTROLE DE SALDO

- Cada funcionário possui um limite mensal de refeições
- Exemplo:
  - João: 120 refeições em Outubro/2026
- O sistema deve:
  - Debitar 1 unidade por refeição consumida
  - Bloquear consumo quando saldo = 0
  - Resetar ou recriar saldo a cada mês

---

## 📲 QR CODE

- Cada refeitório possui um QR Code único
- QR Code contém:
  - ID do refeitório
  - (opcional) token de validação

### Fluxo:
1. Funcionário logado acessa app mobile
2. Escaneia QR Code do refeitório
3. Sistema identifica:
   - Usuário
   - Refeitório
   - Horário atual
4. Sistema valida regras
5. Registra consumo

---

## 📊 DASHBOARD GERENCIAL

O gerente deve visualizar:

- Total de refeições consumidas por período
- Consumo por tipo (café, almoço, etc)
- Consumo por funcionário
- Consumo por refeitório
- Saldo restante por funcionário

---

## 🗄️ MODELO DE DADOS (SUGESTÃO)

Tabelas principais:

- tenants (empresas)
- users
- roles
- user_roles
- restaurants (refeitórios)
- employees (funcionários)
- meal_types
- meal_time_windows
- meal_consumptions
- monthly_allowances

Campos importantes:

- tenant_id (em todas as tabelas)
- consumed_at (timestamp)
- meal_type_id
- restaurant_id
- employee_id

---

## 🔐 SEGURANÇA

- Isolamento por tenant_id em todas queries
- JWT com escopo por tenant
- Proteção contra consumo fraudulento (ex: rate limit, validação de QR)

---

## ⚙️ FUNCIONALIDADES ADICIONAIS (DIFERENCIAL)

- Configuração dinâmica de horários por empresa
- Relatórios exportáveis (PDF/Excel)
- Auditoria de consumo (logs)
- Modo offline com sync posterior (mobile)
- Integração com catracas (opcional)

---

## 📦 ENTREGA ESPERADA

A IA deve fornecer:

1. Arquitetura completa (diagramas opcionais)
2. Modelagem do banco (DDL SQL)
3. Estrutura do backend (controllers, services, entities)
4. Exemplos de endpoints REST
5. Fluxo completo de autenticação
6. Código inicial funcional (boilerplate)
7. Sugestão de deploy com Docker

---

## 🎯 OBJETIVO FINAL

Criar um sistema escalável, seguro e pronto para produção, que permita o controle rigoroso de consumo de refeições em ambientes corporativos multi-tenant.