import pool from "../config/db.config.js"

export const findAdminByUserId = async (userId) => {
  const result = await pool.query("SELECT * FROM admins WHERE user_id = $1", [userId])
  return result.rows[0]
}

export const createAdmin = async (userId, role) => {
  const result = await pool.query("INSERT INTO admins (user_id, role) VALUES ($1, $2) RETURNING *", [userId, role])

  return result.rows[0]
}

export const getAllAdmins = async () => {
  const result = await pool.query(`
    SELECT a.id, a.role, a.created_at, u.email 
    FROM admins a 
    JOIN users u ON a.user_id = u.id
  `)

  return result.rows
}

export const updateAdminRole = async (adminId, role) => {
  const result = await pool.query(
    "UPDATE admins SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
    [role, adminId],
  )

  return result.rows[0]
}

export const deleteAdmin = async (adminId) => {
  await pool.query("DELETE FROM admins WHERE id = $1", [adminId])
}

