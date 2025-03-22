import bcrypt from 'bcryptjs';
import { createAdmin, deleteCommissioner } from '../models/adminModel.js';

export const addCommissioner = async (req, res) => {
  const { email, password, addedBy } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const commissioner = await createAdmin(email, hashedPassword, 'commissioner', addedBy);
    res.status(201).json({ message: 'Commissioner added', commissioner });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeCommissioner = async (req, res) => {
  try {
    await deleteCommissioner(req.params.id);
    res.json({ message: 'Commissioner removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
