// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // your Supabase connection string
  ssl: {
    rejectUnauthorized: false // change this during production
  },
});

module.exports = pool;