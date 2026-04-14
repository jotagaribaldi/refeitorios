-- =====================================================
-- Migração: QR Code por Funcionário
-- =====================================================
-- Remover qr_code_token de restaurants e adicionar em users

-- 1. Adicionar coluna qr_code_token na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_code_token VARCHAR(500);

-- 2. Adicionar índice na coluna qr_code_token da tabela users
CREATE INDEX IF NOT EXISTS idx_users_qr_code_token ON users(qr_code_token);

-- 3. Remover coluna qr_code_token da tabela restaurants (se existir)
ALTER TABLE restaurants DROP COLUMN IF EXISTS qr_code_token;
