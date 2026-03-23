-- Phase 3 Migration: Intelligence & Personalization

-- 1. Update Users Table
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Personality Profiling Tables
CREATE TABLE IF NOT EXISTS personality_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Expert Relationship Questions
INSERT INTO personality_questions (question_text, category) VALUES
('Quando há um conflito na relação, qual é a sua reação inicial habitual?', 'Resolução de Conflitos'),
('Como você prefere que demonstrem afeto e amor por você?', 'Linguagens do Amor'),
('Como você lida com a necessidade de espaço pessoal e individualidade?', 'Espaço Pessoal'),
('Qual é a forma com que você mais costuma demonstrar carinho pelo(a) parceiro(a)?', 'Linguagens do Amor'),
('O que faz você se sentir mais seguro(a) em um relacionamento amoroso?', 'Segurança Emocional'),
('Como você reage quando se sente frustrado(a) ou não ouvido(a)?', 'Comunicação'),
('Na gestão das finanças conjuntas ou decisões materiais, qual o seu perfil?', 'Valores Práticos'),
('Como você avalia a importância do alinhamento de planos para o futuro (moradia, filhos, carreira)?', 'Planos Futuros'),
('Quando você erra e precisa pedir desculpas, qual costuma ser a sua atitude?', 'Responsabilidade Afetiva'),
('Como o estresse externo (trabalho, família) afeta a sua dinâmica amorosa?', 'Inteligência Emocional')
ON CONFLICT (question_text) DO NOTHING;

CREATE TABLE IF NOT EXISTS personality_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES personality_questions(id) ON DELETE CASCADE,
    answer_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

-- 3. SOS Chat Support
ALTER TABLE sos_sessions ADD COLUMN IF NOT EXISTS chat_history JSONB DEFAULT '[]';

-- Note: We changed quiz_answers to personality_answers, quiz answers was a legacy table that was never fully utilized.
