import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const { Pool } = pg;

// Use the credentials discovered for the internal network if running via subagent/easypanel,
// but for local execution, we rely on the .env or explicit values if needed.
// However, I will use a more generic approach that uses the env variables.
const pool = new Pool({
  host: process.env.DB_HOST || 'unia-db',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'unia_secure_password_2026',
  database: process.env.DB_NAME || 'unia',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('--- Starting Migration: Relationship Fixes ---');

    // 1. Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✔ UUID Extension enabled');

    // 2. Ensure "relationships" columns
    await client.query(`
      ALTER TABLE relationships 
      ADD COLUMN IF NOT EXISTS title TEXT,
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'ended')),
      ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('✔ Relationships table updated');

    // 3. Ensure "nodes" columns
    await client.query(`
      ALTER TABLE nodes 
      ADD COLUMN IF NOT EXISTS name TEXT,
      ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'
    `);
    console.log('✔ Nodes table updated');

    console.log('--- Migration Completed Successfully ---');
  } catch (err) {
    console.error('❌ Migration Failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
