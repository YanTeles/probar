const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool - same as PHP config.php
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tabacaria_teste',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '1234',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => console.log('✅ PostgreSQL connected'));
pool.on('error', (err) => console.error('❌ DB Pool error:', err.stack));

module.exports = pool;

