import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export const createAdmin = async (email, password, role, name) => {
  const result = await pool.query(
    'INSERT INTO admins (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [email, password, role, name]
  );
  return result.rows[0];
};

export const deleteCommissioner = async (id) => {
  await pool.query('DELETE FROM commissioners WHERE id = $1', [id]);
};

export const createCommissioner = async (email, password, role, name, addedBy) => {

  const result = await pool.query("INSERT INTO commissioners (name, email, password, role, added_by) VALUES ($1, $2, $3, $4, $5) RETURNING *", 
    [name, email, password, role, addedBy]
  );
  return result.rows[0];
}



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

export const findCommissionerByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM commissioners WHERE email = $1", [email])
  return result.rows[0]
}

/**
 * Get user profile by ID and role
 * @param {number} userId - User ID
 * @param {string} userRole - User role (admin or commissioner)
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (userId, userRole) => {
  let query

  if (userRole === "admin") {
    query = "SELECT id, name, email FROM admins WHERE id = $1"
  } else {
    query = "SELECT id, name, email FROM commissioners WHERE id = $1"
  }

  const result = await pool.query(query, [userId])

  if (result.rows.length === 0) {
    throw new Error("User not found")
  }

  return {
    ...result.rows[0],
    role: userRole,
  }
}

/**
 * Check if email is already in use by another user
 * @param {string} email - Email to check
 * @param {number} userId - Current user ID
 * @param {string} userRole - User role (admin or commissioner)
 * @returns {Promise<boolean>} True if email is already in use
 */
export const isEmailInUse = async (email, userId, userRole) => {
  let query

  if (userRole === "admin") {
    query = "SELECT id FROM admins WHERE email = $1 AND id != $2"
  } else {
    query = "SELECT id FROM commissioners WHERE email = $1 AND id != $2"
  }

  const result = await pool.query(query, [email, userId])
  return result.rows.length > 0
}

/**
 * Update user profile
 * @param {number} userId - User ID
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} userRole - User role (admin or commissioner)
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, name, email, userRole) => {
  let query

  if (userRole === "admin") {
    query = "UPDATE admins SET name = $1, email = $2, updated_at = NOW() WHERE id = $3"
  } else {
    query = "UPDATE commissioners SET name = $1, email = $2, updated_at = NOW() WHERE id = $3"
  }

  await pool.query(query, [name, email, userId])
}

/**
 * Get user password for verification
 * @param {number} userId - User ID
 * @param {string} userRole - User role (admin or commissioner)
 * @returns {Promise<string>} Hashed password
 */
export const getUserPassword = async (userId, userRole) => {
  let query

  if (userRole === "admin") {
    query = "SELECT password FROM admins WHERE id = $1"
  } else {
    query = "SELECT password FROM commissioners WHERE id = $1"
  }

  const result = await pool.query(query, [userId])

  if (result.rows.length === 0) {
    throw new Error("User not found")
  }

  return result.rows[0].password
}

/**
 * Update user password
 * @param {number} userId - User ID
 * @param {string} hashedPassword - Hashed password
 * @param {string} userRole - User role (admin or commissioner)
 * @returns {Promise<void>}
 */
export const updateUserPassword = async (userId, hashedPassword, userRole) => {
  let query

  if (userRole === "admin") {
    query = "UPDATE admins SET password = $1, updated_at = NOW() WHERE id = $2"
  } else {
    query = "UPDATE commissioners SET password = $1, updated_at = NOW() WHERE id = $2"
  }

  await pool.query(query, [hashedPassword, userId])
}

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash)
}

export const deleteUser = async (id) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};
