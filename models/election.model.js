import pool from "../config/db.js";

export const createElection = async (title, description, start_date, end_date, created_by) => {
    const result = await pool.query(
        `INSERT INTO elections (title, description, start_date, end_date, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [title, description, start_date, end_date, created_by]
    );
    return result.rows[0];
};

export const getElectionById = async (id) => {
    const result = await pool.query(`SELECT * FROM elections WHERE id = $1`, [id]);
    return result.rows[0];
};

export const getAllElections = async () => {
    const result = await pool.query(`SELECT * FROM elections`);
    return result.rows;
};

export const updateElection = async (id, title, description, start_date, end_date) => {
    const result = await pool.query(
        `UPDATE elections SET title = $2, description = $3, start_date = $4, end_date = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [id, title, description, start_date, end_date]
    );
    return result.rows[0];
};

export const deleteElection = async (id) => {
    await pool.query(`DELETE FROM elections WHERE id = $1`, [id]);
};

export const getUsersInElection = async (electionId) => {
    const result = await pool.query(
        `SELECT users.id, users.email FROM election_registrations JOIN users ON election_registrations.user_id = users.id WHERE election_registrations.election_id = $1`,
        [electionId]
    );
    return result.rows;
};

export const registerUserForElection = async (electionId, userId) => {
    try {
        const result = await pool.query(
            "INSERT INTO election_registrations (election_id, user_id) VALUES ($1, $2) RETURNING *",
            [electionId, userId]
        );
        return result.rows[0];
    } catch (error) {
        // Handle duplicate registrations gracefully.  For example:
        if (error.code === '23505') {  // Unique violation code
            throw new Error("User already registered for this election");
        }
        throw error;  // Propagate other errors
    }
};

export const unregisterUserForElection = async (electionId, userId) => {
  await pool.query("DELETE FROM election_registrations WHERE election_id = $1 AND user_id = $2", [electionId, userId]);
};