import pool from '../config/database.js';

class Category {
  static async findAll() {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY type, name'
    );
    return result.rows;
  }

  static async findByType(type) {
    const result = await pool.query(
      'SELECT * FROM categories WHERE type = $1 ORDER BY name',
      [type]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByName(name) {
    const result = await pool.query(
      'SELECT * FROM categories WHERE name = $1',
      [name]
    );
    return result.rows[0];
  }

  static async createCustomCategory(name, type, userId) {
    // For custom user-specific categories in the future
    const result = await pool.query(
      'INSERT INTO categories (name, type) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING RETURNING *',
      [name, type]
    );
    return result.rows[0];
  }
}

export default Category;