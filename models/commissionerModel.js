import pool from '../config/db.js';

export const getAllCommissioners = async () => {
  const result = await pool.query('SELECT * FROM admins WHERE role = $1', ['commissioner']);
  return result.rows;
};
