// userController.js

import { banUser, unbanUser, findUserById } from '../models/userModel.js';

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