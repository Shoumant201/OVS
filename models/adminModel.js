import pool from '../config/db.js';

export const createAdmin = async (email, password, role, name) => {
  const result = await pool.query(
    'INSERT INTO admins (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [email, password, role, name]
  );
  return result.rows[0];
};

export const deleteCommissioner = async (id) => {
  await pool.query('DELETE FROM admins WHERE id = $1 AND role = $2', [id, 'commissioner']);
};

export const updateAdminById = async (id, updateData) => {
  const result = await pool.query(
    'UPDATE admins SET is_verified = $1 WHERE id = $2 RETURNING *',
    [updateData.is_verified, id]
  );
  return result.rows[0];
};


export const findAdminByEmail = async (email) => {
const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
return result.rows[0];
};

// Update user password
export const updateAdminPassword = async (userId, newPassword) => {
  const result = await pool.query(
    'UPDATE admins SET password = $1 WHERE id = $2 RETURNING *',
    [newPassword, userId]
  );
  return result.rows[0];
};

// Find admin by user ID
export const findAdminByUserId = async (id) => {
  const result = await pool.query('SELECT * FROM admins WHERE id = $1', [id]);
  return result.rows[0];
};