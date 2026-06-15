DROP TABLE IF EXISTS daily_snapshots CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income','expense','savings')),
    icon VARCHAR(50),
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_name ON categories(name);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    type VARCHAR(20) NOT NULL CHECK (type IN ('income','expense','savings')),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    source VARCHAR(255),
    transaction_date TIMESTAMP NOT NULL,
    is_parsed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_date_type ON transactions(user_id, transaction_date, type);

CREATE TABLE daily_snapshots (
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

CREATE INDEX idx_snapshots_user_id ON daily_snapshots(user_id);
CREATE INDEX idx_snapshots_user_date ON daily_snapshots(user_id, snapshot_date);
CREATE INDEX idx_snapshots_date ON daily_snapshots(snapshot_date);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO categories (name, type, icon, color) VALUES
('Transport','expense','🚗','#10B981'),
('Food','expense','🍔','#EF4444'),
('Data','expense','📱','#3B82F6'),
('Gift','expense','🎁','#F59E0B'),
('School','expense','📚','#8B5CF6'),
('Tithe','expense','⛪','#EC4899'),
('Shopping','expense','🛒','#F97316'),
('Entertainment','expense','🎬','#A855F7'),
('Health','expense','🏥','#EF4444'),
('Utilities','expense','💡','#6B7280'),
('Rent','expense','🏠','#8B5CF6'),
('Insurance','expense','🛡️','#3B82F6'),
('Other','expense','📝','#9CA3AF')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, type, icon, color) VALUES
('Savings','savings','💰','#10B981'),
('Emergency Fund','savings','🚨','#EF4444'),
('Investment','savings','📈','#3B82F6'),
('Retirement','savings','👴','#8B5CF6'),
('Education Fund','savings','🎓','#F59E0B')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name, type, icon, color) VALUES
('Salary','income','💼','#10B981'),
('Freelance','income','💻','#3B82F6'),
('Gift Received','income','🎁','#F59E0B'),
('Investment Return','income','📊','#8B5CF6'),
('Business','income','🏪','#F97316'),
('Refund','income','🔄','#6B7280'),
('Other Income','income','💰','#9CA3AF')
ON CONFLICT (name) DO NOTHING;

CREATE OR REPLACE VIEW weekly_summaries AS
SELECT 
    user_id,
    DATE_TRUNC('week', transaction_date) AS week_start,
    DATE_TRUNC('week', transaction_date) + INTERVAL '6 days' AS week_end,
    SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS income,
    SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expenses,
    SUM(CASE WHEN type='savings' THEN amount ELSE 0 END) AS savings,
    COUNT(*) AS transaction_count
FROM transactions
GROUP BY user_id, DATE_TRUNC('week', transaction_date);

CREATE OR REPLACE VIEW monthly_summaries AS
SELECT 
    user_id,
    DATE_TRUNC('month', transaction_date) AS month_start,
    DATE_TRUNC('month', transaction_date) + INTERVAL '1 month' - INTERVAL '1 day' AS month_end,
    SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS income,
    SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expenses,
    SUM(CASE WHEN type='savings' THEN amount ELSE 0 END) AS savings,
    COUNT(*) AS transaction_count
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', transaction_date);

CREATE OR REPLACE VIEW category_totals AS
SELECT 
    t.user_id,
    c.name AS category_name,
    c.type AS category_type,
    SUM(t.amount) AS total_amount,
    COUNT(t.id) AS transaction_count,
    AVG(t.amount) AS average_amount
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
GROUP BY t.user_id, c.name, c.type;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_transactions_dashboard
ON transactions(user_id, transaction_date, type, amount);

CREATE INDEX idx_transactions_cash
ON transactions(user_id, transaction_date)
WHERE source IN ('manual','cash');

CREATE INDEX idx_transactions_description_trgm
ON transactions USING gin(description gin_trgm_ops);

COMMENT ON DATABASE mactrack_db IS 'MacTrack Finance DB';
COMMENT ON TABLE users IS 'Users';
COMMENT ON TABLE categories IS 'Income/Expense/Savings categories';
COMMENT ON TABLE transactions IS 'User transactions';
COMMENT ON TABLE daily_snapshots IS 'Daily financial snapshots';