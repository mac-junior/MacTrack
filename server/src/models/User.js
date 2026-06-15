import pool from '../config/database.js';
import bcrypt from 'bcrypt';

class User {
  static async create({ username, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [username, email.toLowerCase(), hashedPassword]
    );
    
    return result.rows[0];
  }
  
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    return result.rows[0];
  }
  
  static async findByUsername(username) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }
  
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
  
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default User;