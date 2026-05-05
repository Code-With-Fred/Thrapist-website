import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import path from 'path';

async function runMigrations(): Promise<void> {
  const DATABASE_URL = process.env['DATABASE_URL'];

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 1,
  });

  const db = drizzle(pool);

  const migrationsFolder = path.join(__dirname, 'migrations');

  console.log('Running migrations from:', migrationsFolder);

  try {
    await migrate(db, { migrationsFolder });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigrations().catch((error: unknown) => {
  console.error('Fatal migration error:', error);
  process.exit(1);
});
