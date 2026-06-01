import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const client = new Client({
  user: process.env.DATABASE_USER || 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  database: process.env.DATABASE_NAME || '2FPC',
  password: process.env.DATABASE_PASSWORD || 'Pole2108',
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5433,
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');

    const orphanQuery = `SELECT r.reimburse_id, r.user_id
FROM reimburse r
LEFT JOIN users u ON r.user_id = u.user_id
WHERE u.user_id IS NULL;`;

    const { rows } = await client.query(orphanQuery);
    if (rows.length === 0) {
      console.log('No orphan reimburse rows found.');
    } else {
      console.log(`Found ${rows.length} orphan reimburse rows:`);
      console.table(rows);
    }

    // Also list reimburse rows with user present but no staff_details (so departement might be missing)
    const noStaffDetailQuery = `SELECT r.reimburse_id, r.user_id, u.name
FROM reimburse r
JOIN users u ON r.user_id = u.user_id
LEFT JOIN staff_details s ON s.user_id = u.user_id
WHERE s.user_id IS NULL;`;

    const noStaff = await client.query(noStaffDetailQuery);
    if (noStaff.rows.length === 0) {
      console.log('All reimburse users have staff_details.');
    } else {
      console.log(`Found ${noStaff.rows.length} reimburse rows with missing staff_details:`);
      console.table(noStaff.rows);
    }

  } catch (err) {
    console.error('Error running checks:', err);
    process.exitCode = 2;
  } finally {
    await client.end();
  }
}

run();
