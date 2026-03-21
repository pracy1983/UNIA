import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  const client = await pool.connect();
  try {
    console.log('--- Checking "relationships" columns ---');
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'relationships'
    `);
    console.table(cols.rows);

    console.log('--- Checking "nodes" columns ---');
    const nodeCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'nodes'
    `);
    console.table(nodeCols.rows);

    console.log('--- Checking UUID functions ---');
    const funcExists = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_name IN ('uuid_generate_v4', 'gen_random_uuid')
    `);
    console.table(funcExists.rows);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema();
