const { Pool } = require('pg');

// Determine database configuration based on available environment variables
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if available (production/cloud databases)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false,
    } : false, // Disable SSL for local development
  };
} else {
  // Fall back to individual database variables (local development)
  poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: false, // Always disable SSL for local connections
  };
}

const pool = new Pool(poolConfig);

pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection error:', err));

module.exports = {
  query: (text, params) => pool.query(text, params)
};
