-- Migration to update relationship types

-- 1. Remove old constraint
ALTER TABLE relationships DROP CONSTRAINT IF EXISTS relationships_type_check;

-- 2. Add new constraint with updated types
ALTER TABLE relationships ADD CONSTRAINT relationships_type_check 
CHECK (type IN ('namoro', 'casamento', 'noivado', 'afeto', 'ficante', 'amizade colorida', 'solo', 'dating', 'marriage', 'poly', 'open', 'friendship'));

-- Note: I'm keeping the old types in the constraint for now to avoid breaking existing data if any, 
-- but the UI will only show the new ones.
