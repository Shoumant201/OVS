import { getAllCommissioners } from '../models/commissionerModel.js';

export const getCommissioners = async (req, res) => {
  try {
    const commissioners = await getAllCommissioners();
    res.json(commissioners);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
