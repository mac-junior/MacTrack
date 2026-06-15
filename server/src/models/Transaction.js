import pool from '../config/database.js';

class Transaction {
  static async create({ userId, amount, type, categoryId, description, source, transactionDate, isParsed = false }) {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, amount, type, category_id, description, source, transaction_date, is_parsed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, amount, type, categoryId, description, source, transactionDate, isParsed]
    );
    return result.rows[0];
  }

  static async findByUser(userId, limit = 100, offset = 0, startDate = null, endDate = null) {
    let query = `
      SELECT t.*, c.name as category_name, c.type as category_type
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND t.transaction_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND t.transaction_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY t.transaction_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getTodayTransactions(userId, date) {
    const result = await pool.query(
      `SELECT t.*, c.name as category_name, c.type as category_type
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 
         AND DATE(t.transaction_date) = $2
       ORDER BY t.transaction_date DESC`,
      [userId, date]
    );
    return result.rows;
  }

  static async getBalance(userId, date) {
    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN type = 'savings' THEN amount ELSE 0 END), 0) as total_savings
       FROM transactions
       WHERE user_id = $1 
         AND DATE(transaction_date) = $2`,
      [userId, date]
    );
    return result.rows[0];
  }

  static async getAllTimeBalance(userId) {
    const result = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN type = 'savings' THEN amount ELSE 0 END), 0) as total_savings
       FROM transactions
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  static async getTransactionsByWeek(userId, weekStart, weekEnd) {
    const result = await pool.query(
      `SELECT t.*, c.name as category_name, c.type as category_type
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 
         AND DATE(t.transaction_date) >= $2 
         AND DATE(t.transaction_date) <= $3
       ORDER BY t.transaction_date DESC`,
      [userId, weekStart, weekEnd]
    );
    return result.rows;
  }

  static async update(id, userId, updates) {
    const allowedFields = ['category_id', 'description', 'amount', 'transaction_date'];
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClause.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    }

    if (setClause.length === 0) return null;

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, userId);

    const result = await pool.query(
      `UPDATE transactions 
       SET ${setClause.join(', ')}
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rows[0];
  }
}

export default Transaction;