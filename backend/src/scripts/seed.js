const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function runSeed() {
  console.log('[Seed] Starting database migration & seed...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../../database/seed.sql');

    if (fs.existsSync(schemaPath)) {
      console.log('[Seed] Applying schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('[Seed] schema.sql applied successfully.');
    }

    if (fs.existsSync(seedPath)) {
      console.log('[Seed] Applying seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log('[Seed] seed.sql applied successfully.');
    }

    console.log('[Seed] Database successfully seeded!');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runSeed();
