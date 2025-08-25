const { Pool } = require('pg');

// Use connection string
const connectionString = 'postgresql://postgres:postgres098@localhost:5432/event_manager';

const pool = new Pool({
  connectionString: connectionString,
});

// Test connection immediately
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
  });

// Connection event handlers for future connections
pool.on('connect', () => {
  console.log('✅ New database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};