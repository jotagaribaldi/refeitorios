-- =====================================================
-- Sistema de Refeitórios Corporativos - Schema DDL
-- =====================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TENANTS (Empresas)
-- =====================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  email VARCHAR(200) NOT NULL UNIQUE,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- USERS (Usuários: ROOT, GERENTE, FUNCIONARIO)
-- =====================================================
CREATE TYPE user_role AS ENUM ('ROOT', 'GERENTE', 'FUNCIONARIO');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'FUNCIONARIO',
  employee_code VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- RESTAURANTS (Refeitórios)
-- =====================================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  location VARCHAR(300),
  qr_code_token VARCHAR(500) UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_restaurants_tenant ON restaurants(tenant_id);

-- =====================================================
-- MEAL TYPES (Tipos de Refeições - fixos)
-- =====================================================
CREATE TABLE meal_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  sort_order INT DEFAULT 0
);

INSERT INTO meal_types (name, slug, sort_order) VALUES
  ('Café da Manhã', 'cafe-manha', 1),
  ('Almoço', 'almoco', 2),
  ('Lanche da Tarde', 'lanche-tarde', 3),
  ('Jantar', 'jantar', 4),
  ('Lanche da Noite', 'lanche-noite', 5);

-- =====================================================
-- MEAL TIME WINDOWS (Horários por empresa e tipo)
-- =====================================================
CREATE TABLE meal_time_windows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  meal_type_id UUID NOT NULL REFERENCES meal_types(id),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  allow_duplicate BOOLEAN DEFAULT FALSE,  -- permite 2x no mesmo dia?
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(tenant_id, meal_type_id)
);

CREATE INDEX idx_mtw_tenant ON meal_time_windows(tenant_id);

-- =====================================================
-- MONTHLY ALLOWANCES (Saldo mensal por funcionário)
-- =====================================================
CREATE TABLE monthly_allowances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL,  -- 1-12
  total_allowance INT NOT NULL DEFAULT 0,
  consumed INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, year, month)
);

CREATE INDEX idx_allowances_tenant ON monthly_allowances(tenant_id);
CREATE INDEX idx_allowances_user ON monthly_allowances(user_id);

-- =====================================================
-- MEAL CONSUMPTIONS (Registros de consumo)
-- =====================================================
CREATE TABLE meal_consumptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  meal_type_id UUID NOT NULL REFERENCES meal_types(id),
  consumed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_consumptions_tenant ON meal_consumptions(tenant_id);
CREATE INDEX idx_consumptions_user ON meal_consumptions(user_id);
CREATE INDEX idx_consumptions_date ON meal_consumptions(date);
CREATE INDEX idx_consumptions_restaurant ON meal_consumptions(restaurant_id);
