// userController.js

import { banUser, unbanUser, findUserById, createUserProfile, update2FAById, updateOnboardingById } from '../models/userModel.js';

// Ban User Controller
export const banUserController = async (req, res) => {
  const { id } = req.params; // User ID to ban
  try {
    const user = await findUserById(id); //Check user before doing action on this
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const bannedUser = await banUser(id);
    res.status(200).json({ message: 'User banned successfully', bannedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unban User Controller
export const unbanUserController = async (req, res) => {
  const { id } = req.params; // User ID to unban
  try {
      const user = await findUserById(id); //Check user before doing action on this
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    const unbannedUser = await unbanUser(id);
    res.status(200).json({ message: 'User unbanned successfully', unbannedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUserProfileController = async (req, res) => {
  const {user_id, full_name, email, phone, dob, gender, country, state, city, postal_code, ethnicity, occupation, education, profile_image} = req.body;

  console.log("Received Body:", req.body);
  
  const requiredFields = [user_id, full_name, email, phone, dob, gender, country, state, city, postal_code, ethnicity, occupation, education];

  if (requiredFields.some(field => !field)) {
    return res.status(400).json({ message: 'All Fields are required' });
  }
  try{
    const userProfile = await createUserProfile(user_id, full_name, email, phone, dob, gender, country, state, city, postal_code, ethnicity, occupation, education, profile_image);

    res.status(201).json({ message: 'User Profile registered.' });
  } catch (err) {
    console.error('Profile Registration Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }

}

// controllers/userController.js
export const update2FAByIdController = async (req, res) => {
  const { user_id, is_2faenabled } = req.body;
  try {
    const user = await update2FAById(user_id, is_2faenabled);
    res.status(200).json({ message: '2FA updated.', user });
  } catch (err) {
    console.error('2FA update Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateOnboardingByIdController = async (req, res) => {
  const { user_id, onboarding } = req.body;
  try {
    const user = await updateOnboardingById(user_id, onboarding);
    res.status(200).json({ message: 'Onboarding updated.', user });
  } catch (err) {
    console.error('Onboarding update Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
