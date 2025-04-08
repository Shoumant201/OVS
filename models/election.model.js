import pool from "../config/db.js";

export const createElection = async (title, start_date, end_date,created_by, created_by_column) => {
    const result = await pool.query(
        `INSERT INTO elections (title, start_date, end_date, ${created_by_column}) VALUES ($1, $2, $3, $4) RETURNING *`,
        [title, start_date, end_date, created_by]
    );
    return result.rows[0];
};

export const createQuestion = async (election_id, title, description,shuffle) => {
    const result = await pool.query(
        `INSERT INTO questions (election_id, title, description, shuffle) VALUES ($1, $2, $3, $4) RETURNING *`,
        [election_id, title, description, shuffle]
    );
    return result.rows[0];
};

export const createCandidate = async (question_id, candidate_name, candidate_bio, description, image) => {
    const result = await pool.query(
        `INSERT INTO candidates (question_id, candidate_name, candidate_bio, description, image) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [question_id, candidate_name, candidate_bio, description, image]
    );
    return result.rows[0];
}

export const getQuestionByElectionId = async (id) => {
    const result = await pool.query(`SELECT * FROM questions WHERE election_id = $1`, [id]);
    return result.rows;
};

export const getAllQuestions = async () => {
    const result = await pool.query(`SELECT * FROM questions`);
    return result.rows;
};

export const getCandidateByQuestionId = async (id) => {
    const result = await pool.query(`SELECT * FROM candidates WHERE question_id = $1`, [id]);
    return result.rows;
};

export const getAllCandidates = async () => {
    const result = await pool.query(`SELECT * FROM candidates`);
    return result.rows;
};

export const getElectionById = async (id) => {
    const result = await pool.query(`SELECT * FROM elections WHERE id = $1`, [id]);
    return result.rows[0];
};

export const getAllElections = async () => {
    const result = await pool.query(`SELECT * FROM elections`);
    return result.rows;
};

export const updateElection = async (id, fields) => {
    const keys = Object.keys(fields);
  
    // Dynamically build the SET clause
    const setClause = keys
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
  
    const values = keys.map(key => fields[key]);
  
    const query = `
      UPDATE elections
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
  
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  };

  export const updateQuestion = async (id, fields) => {
    const keys = Object.keys(fields);
  
    // Dynamically build the SET clause
    const setClause = keys
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
  
    const values = keys.map(key => fields[key]);
  
    const query = `
      UPDATE questions
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
  
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  };

  export const updateCandidate = async (id, fields) => {
    const keys = Object.keys(fields);
  
    // Dynamically build the SET clause
    const setClause = keys
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ");
  
    const values = keys.map(key => fields[key]);
  
    const query = `
      UPDATE candidates
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
  
    const result = await pool.query(query, [id, ...values]);
    return result.rows[0];
  };
  

export const deleteElection = async (id) => {
    await pool.query(`DELETE FROM elections WHERE id = $1`, [id]);
};

export const deleteQuestion = async (id) => {
    await pool.query(`DELETE FROM questions WHERE id = $1`, [id]);
};

export const deleteCandidate = async (id) => {
    await pool.query(`DELETE FROM candidates WHERE id = $1`, [id]);
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