-- Feature Expansion Migration (Updated with missing columns)

-- 1. Update relationships table
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS started_at DATE DEFAULT CURRENT_DATE;
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS invite_token UUID DEFAULT gen_random_uuid();
ALTER TABLE relationships ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- 2. Update nodes table
ALTER TABLE nodes ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE nodes ADD COLUMN IF NOT EXISTS label TEXT;

-- 3. Update memories table
-- Note: Check if memories exists first, or use IF NOT EXISTS for column
ALTER TABLE memories ADD COLUMN IF NOT EXISTS relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE;

-- 4. Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    link_url TEXT,
    image_url TEXT,
    description TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create relationship_history table
CREATE TABLE IF NOT EXISTS relationship_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT,
    change_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
