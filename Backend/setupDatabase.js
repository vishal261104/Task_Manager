import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ,
  });

  try {
    const schemaPath = join(__dirname, 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schema);
    console.log('Database schema applied successfully.');
  } catch (error) {
    console.error('Failed to apply database schema:', error?.message || error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setupDatabase();
