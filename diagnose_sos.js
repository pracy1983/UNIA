import pool from './backend/src/config/database.js';

async function diagnose() {
  try {
    console.log('--- Checking sos_sessions columns ---');
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sos_sessions'
    `);
    console.log(JSON.stringify(cols.rows, null, 2));

    console.log('--- Checking personality tables ---');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('personality_questions', 'personality_answers')
    `);
    console.log(JSON.stringify(tables.rows, null, 2));

  } catch (err) {
    console.error('DIAGNOSTIC FAILED:', err);
  } finally {
    process.exit(0);
  }
}

diagnose();
