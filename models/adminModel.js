import pool from '../config/db.js';

export const createAdmin = async (email, password, role, addedBy) => {
  const result = await pool.query(
    'INSERT INTO admins (email, password, role, added_by) VALUES ($1, $2, $3, $4) RETURNING *',
    [email, password, role, addedBy]
  );
  return result.rows[0];
};

export const deleteCommissioner = async (id) => {
  await pool.query('DELETE FROM admins WHERE id = $1 AND role = $2', [id, 'commissioner']);
};
// Find admin by user ID
export const findAdminByUserId = async (id) => {
  const result = await pool.query('SELECT * FROM admins WHERE id = $1', [id]);
  return result.rows[0];
};