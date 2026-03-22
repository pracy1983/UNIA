-- Migration Script to sync Production with latest schema.sql

-- 1. Update Users Table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- 2. Update Nodes Table
ALTER TABLE nodes ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE nodes ALTER COLUMN name TYPE TEXT;
ALTER TABLE nodes ALTER COLUMN type TYPE TEXT;

-- 3. Update Relationships Table
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Relaxation of legacy NOT NULL constraints
ALTER TABLE relationships ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE relationships ALTER COLUMN source_node_id DROP NOT NULL;
ALTER TABLE relationships ALTER COLUMN target_node_id DROP NOT NULL;

-- 4. Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS relationship_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(relationship_id, node_id)
);

CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    occurrence_date TIMESTAMP WITH TIME ZONE NOT NULL,
    media_urls JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    created_by_node_id UUID REFERENCES nodes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text TEXT NOT NULL,
    category TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    answer_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, question_id)
);

CREATE TABLE IF NOT EXISTS conflict_resolutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
    outcome_summary TEXT,
    consensus_points JSONB DEFAULT '[]',
    action_items JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_pills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Check for index existence before creating (Postgres 9.5+)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_daily_pills_user_day') THEN
        CREATE UNIQUE INDEX idx_daily_pills_user_day ON daily_pills (user_id, date_trunc('day', created_at));
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS sos_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    advice_received JSONB NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
