import pool from '../config/db.js';
import bcrypt from 'bcrypt';


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

export const getUserProfile = async (id) => {
  const result = await pool.query('SELECT * from user_profiles WHERE user_id = $1', [id]);
  return result.rows[0];
}

// export const getUserProfile = async (userId) => {
//   const userResult = await pool.query(
//     `SELECT 
//       u.name,
//       u.email,
//       u.is_2faenabled,
//       p.full_name,
//       p.phone,
//       p.dob,
//       p.gender,
//       p.country,
//       p.state,
//       p.city,
//       p.postal_code,
//       p.ethnicity,
//       p.occupation,
//       p.education,
//       p.profile_image
//     FROM users u
//     LEFT JOIN user_profiles p ON u.id = p.user_id
//     WHERE u.id = $1`,
//     [userId]
//   );

//   const user = userResult.rows[0];
//   if (!user) return null;

//   return {
//     fullName: user.full_name || user.name,
//     email: user.email,
//     phoneNumber: user.phone || '',
//     dateOfBirth: user.dob || '',
//     gender: user.gender || '',
//     country: user.country || '',
//     state: user.state || '',
//     city: user.city || '',
//     postalCode: user.postal_code || '',
//     ethnicity: user.ethnicity || '',
//     occupation: user.occupation || '',
//     educationLevel: user.education || '',
//     image: user.profile_image || '',
//     is_2faenabled: user.is_2faenabled,
//   };
// };

export const updateUserProfile = async (userId, profileData) => {
  // Update name in users table
  await pool.query(
    'UPDATE users SET name = $1 WHERE id = $2',
    [profileData.fullName, userId]
  );

  // Check if profile exists
  const existingProfile = await pool.query(
    'SELECT * FROM user_profiles WHERE user_id = $1',
    [userId]
  );

  if (existingProfile.rows.length > 0) {
    // Update existing profile
    await pool.query(
      `UPDATE user_profiles SET
        full_name = $1,
        phone = $2,
        dob = $3,
        gender = $4,
        country = $5,
        state = $6,
        city = $7,
        postal_code = $8,
        ethnicity = $9,
        occupation = $10,
        education = $11,
        profile_image = $12
      WHERE user_id = $13`,
      [
        profileData.fullName,
        profileData.phoneNumber,
        profileData.dateOfBirth,
        profileData.gender,
        profileData.country,
        profileData.state,
        profileData.city,
        profileData.postalCode,
        profileData.ethnicity,
        profileData.occupation,
        profileData.educationLevel,
        profileData.image,
        userId
      ]
    );
  } else {
    // Insert new profile
    await pool.query(
      `INSERT INTO user_profiles (
        user_id, full_name, phone, dob, gender, country, state,
        city, postal_code, ethnicity, occupation, education, profile_image
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13
      )`,
      [
        userId,
        profileData.fullName,
        profileData.phoneNumber,
        profileData.dateOfBirth,
        profileData.gender,
        profileData.country,
        profileData.state,
        profileData.city,
        profileData.postalCode,
        profileData.ethnicity,
        profileData.occupation,
        profileData.educationLevel,
        profileData.image
      ]
    );
  }

  return { message: 'Profile updated successfully' };
};



// export const updateUserPassword1 = async (userId, newPassword) => {
//   const hashedPassword = await bcrypt.hash(newPassword, 10);
//   const result = await pool.query(
//     'UPDATE users SET password = $1 WHERE id = $2 RETURNING *',
//     [hashedPassword, userId]
//   );
//   return result.rows[0];
// };



// export const verifyPassword = async (plainPassword, hashedPassword) => {
//   return bcrypt.compare(plainPassword, hashedPassword);
// };


