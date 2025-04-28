import pool from '../config/db.js';

export const getAllCommissioners = async () => {
  const result = await pool.query('SELECT * FROM commissioners WHERE role = $1', ['Commissioner']);
  return result.rows;
};
