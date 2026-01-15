import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database connection for migration
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

/**
 * Run database migrations
 */
async function migrate() {
  try {
    console.log('🔄 Running database migrations...');
    console.log('📊 Connecting to:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));

    // Read migration SQL file
    const sql = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );

    // Execute migration
    await db.query(sql);

    console.log('✅ Database migrations completed successfully');
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await db.end();
    process.exit(1);
  }
}

migrate();

