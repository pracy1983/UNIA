import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
    try {
        const check = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'memories'
        `);
        console.log("Memories Table Columns:");
        console.table(check.rows);
    } catch(err) {
        console.error("Error:", err.message);
    } finally {
        await pool.end();
    }
}

main();
