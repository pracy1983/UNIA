-- WhatsApp Auth Migration
-- Autenticação passa a ser via código OTP no WhatsApp. E-mail continua obrigatório no cadastro.

-- 1. Telefone no usuário (identificador de login)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE;

-- 2. Senha deixa de ser obrigatória (login é por OTP)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 3. Códigos OTP enviados por WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_otps_phone ON whatsapp_otps (phone, created_at DESC);
