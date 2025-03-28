import { getAllCommissioners } from '../models/commissionerModel.js';

export const getCommissioners = async (req, res) => {
  try {
    const commissioners = await getAllCommissioners();
    res.json(commissioners);
  } catch (err) {
    console.error("Error fetching commissioner:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
};

export const getCommissionerById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query("SELECT * FROM commissioners WHERE id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Commissioner not found" })
    }

    res.status(200).json(result.rows[0])
  } catch (err) {
    console.error("Error fetching commissioner:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
}