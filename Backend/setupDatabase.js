import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  const rawConnectionString = process.env.DATABASE_URL || process.env.POSTGRES_URI;
  const connectionString = (rawConnectionString || '').trim();

  if (!connectionString) {
    console.error('Failed to apply database schema: Missing DATABASE_URL (or POSTGRES_URI).');
    process.exitCode = 1;
    return;
  }

  let parsed;
  try {
    parsed = new URL(connectionString);
  } catch {
    console.error('Failed to apply database schema: DATABASE_URL is not a valid URL.');
    process.exitCode = 1;
    return;
  }

  const host = parsed.hostname;
  const port = parsed.port || '5432';
  const database = (parsed.pathname || '').replace(/^\//, '');

  if (host.endsWith('-a')) {
    console.error(
      'Heads up: your DATABASE_URL hostname ends with "-a" (Render internal host). ' +
        'That only works from Render services. If you are running this from your laptop, ' +
        'use the Render Postgres *External Database URL* instead.'
    );
  }

  const isLocalHost = host === 'localhost' || host === '127.0.0.1';

  const pool = new Pool({
    connectionString,
    ssl: isLocalHost ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    const schemaPath = join(__dirname, 'config', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log(`Applying schema to ${host}:${port}/${database} ...`);
    await pool.query(schema);
    console.log('Database schema applied successfully.');
  } catch (error) {
    console.error('Failed to apply database schema:', error?.message || error);
    if (error?.code) console.error('Code:', error.code);
    if (error?.errno) console.error('Errno:', error.errno);
    console.error(`Target: ${host}:${port}/${database}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setupDatabase();
