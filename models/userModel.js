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

// models/userModel.js
export const update2FAById = async (id, is_2faenabled) => {
  const result = await pool.query(
    'UPDATE users SET is_2faenabled = $1 WHERE id = $2 RETURNING *',
    [is_2faenabled, id]
  );
  return result.rows[0];
};

export const updateOnboardingById = async (id, onboarding) => {
  const result = await pool.query(
    'UPDATE users SET onboarding = $1 WHERE id = $2 RETURNING *',
    [onboarding, id]
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

// Ban User
export const banUser = async (userId) => {
  const result = await pool.query(
    'UPDATE users SET is_banned = TRUE WHERE id = $1 RETURNING *',
    [userId]
  );
  return result.rows[0];
};

// Unban User
export const unbanUser = async (userId) => {
  const result = await pool.query(
    'UPDATE users SET is_banned = FALSE WHERE id = $1 RETURNING *',
    [userId]
  );
  return result.rows[0];
};

export const getAllUsers = async () => {
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
};

export const createUserProfile = async (
  user_id,
  full_name,
  email,
  phone,
  dob,
  gender,
  country,
  state,
  city,
  postal_code,
  ethnicity,
  occupation,
  education,
  profile_image
) => {
  const result = await pool.query(
    `INSERT INTO user_profiles (
      user_id, full_name, email, phone, dob, gender, country,
      state, city, postal_code, ethnicity, occupation, education, profile_image
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13, $14
    ) RETURNING *`,
    [
      user_id,
      full_name,
      email,
      phone,
      dob,
      gender,
      country,
      state,
      city,
      postal_code,
      ethnicity,
      occupation,
      education,
      profile_image
    ]
  );

  return result.rows[0];
};


