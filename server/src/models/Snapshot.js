import pool from '../config/database.js';

class Snapshot {
  static async create({ userId, snapshotDate, openingBalance, totalIncome, totalExpenses, totalSavings, closingBalance, unaccountedMoney }) {
    const result = await pool.query(
      `INSERT INTO daily_snapshots 
       (user_id, snapshot_date, opening_balance, total_income, total_expenses, total_savings, closing_balance, unaccounted_money)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, snapshot_date) 
       DO UPDATE SET 
         opening_balance = EXCLUDED.opening_balance,
         total_income = EXCLUDED.total_income,
         total_expenses = EXCLUDED.total_expenses,
         total_savings = EXCLUDED.total_savings,
         closing_balance = EXCLUDED.closing_balance,
         unaccounted_money = EXCLUDED.unaccounted_money
       RETURNING *`,
      [userId, snapshotDate, openingBalance, totalIncome, totalExpenses, totalSavings, closingBalance, unaccountedMoney]
    );
    return result.rows[0];
  }

  static async findByUserAndDate(userId, date) {
    const result = await pool.query(
      'SELECT * FROM daily_snapshots WHERE user_id = $1 AND snapshot_date = $2',
      [userId, date]
    );
    return result.rows[0];
  }

  static async getLastSnapshot(userId) {
    const result = await pool.query(
      'SELECT * FROM daily_snapshots WHERE user_id = $1 ORDER BY snapshot_date DESC LIMIT 1',
      [userId]
    );
    return result.rows[0];
  }

  static async getHistoricalSnapshots(userId, limit = 30) {
    const result = await pool.query(
      'SELECT * FROM daily_snapshots WHERE user_id = $1 ORDER BY snapshot_date DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  }

  static async getWeekSummaries(userId, year = null) {
    let query = `
      SELECT 
        DATE_TRUNC('week', snapshot_date) as week_start,
        DATE_TRUNC('week', snapshot_date) + INTERVAL '6 days' as week_end,
        SUM(total_income) as week_income,
        SUM(total_expenses) as week_expenses,
        SUM(total_savings) as week_savings,
        AVG(unaccounted_money) as avg_unaccounted
      FROM daily_snapshots
      WHERE user_id = $1
    `;
    const params = [userId];
    
    if (year) {
      query += ` AND EXTRACT(YEAR FROM snapshot_date) = $2`;
      params.push(year);
    }
    
    query += ` GROUP BY DATE_TRUNC('week', snapshot_date) ORDER BY week_start DESC`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }
}

export default Snapshot;