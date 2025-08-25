const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres098@localhost:5432/event_manager'
});

async function test() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    const result = await client.query('SELECT NOW()');
    console.log('Current time:', result.rows[0].now);
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

test();