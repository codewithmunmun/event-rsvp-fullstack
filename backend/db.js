const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const isProduction = process.env.NODE_ENV === 'production';

const poolConfig = isProduction
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    };

const pool = new Pool(poolConfig);

// Test connection
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL Database'))
  .catch(err => console.error('❌ Database connection error:', err.message));

module.exports = pool;
