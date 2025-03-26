import pool from '../config/db.js';

export const createUser = async (name, email, hashedPassword) => {
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );
    return result.rows[0];
};

export const updateUserById = async (id, updateData) => {
    const result = await pool.query(
      'UPDATE users SET is_verified = $1 WHERE id = $2 RETURNING *',
      [updateData.is_verified, id]
    );
    return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

// Find user by ID
export const findUserById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

// Update user password
export const updateUserPassword = async (userId, newPassword) => {
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2 RETURNING *',
      [newPassword, userId]
    );
    return result.rows[0];
};
