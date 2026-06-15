import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Database initialization SQL
const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'savings')),
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default categories
    await client.query(`
      INSERT INTO categories (name, type) VALUES
        ('Transport', 'expense'),
        ('Food', 'expense'),
        ('Data', 'expense'),
        ('Gift', 'expense'),
        ('School', 'expense'),
        ('Savings', 'savings'),
        ('Tithe', 'expense'),
        ('Shopping', 'expense'),
        ('Other', 'expense'),
        ('Salary', 'income'),
        ('Freelance', 'income'),
        ('Gift Received', 'income'),
        ('Other Income', 'income')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'savings')),
        category_id INTEGER REFERENCES categories(id),
        description TEXT,
        source VARCHAR(255),
        transaction_date TIMESTAMP NOT NULL,
            is_parsed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create daily snapshots table
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_snapshots (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        snapshot_date DATE NOT NULL,
        opening_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
        total_income DECIMAL(10,2) NOT NULL DEFAULT 0,
        total_expenses DECIMAL(10,2) NOT NULL DEFAULT 0,
        total_savings DECIMAL(10,2) NOT NULL DEFAULT 0,
        closing_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
        unaccounted_money DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, snapshot_date)
      );
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Initialize database on startup
initDatabase().catch(console.error);

export default pool;