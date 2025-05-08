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

export const getUserElections = async () => {
    const result = await pool.query(`SELECT * FROM elections WHERE status = 'ongoing' OR status = 'scheduled' OR status = 'finished'`);
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

/**
 * Get election results with vote counts
 * @param {number|string} id - Election ID
 * @returns {Promise<Object>} Election results with vote counts
 */
export const getElectionResults = async (id) => {
    // Get election details
    const electionResult = await pool.query(
      "SELECT id, title, description, end_date FROM elections WHERE id = $1",
      [id]
    );
  
    if (electionResult.rows.length === 0) {
      throw new Error("Election not found");
    }
  
    const election = electionResult.rows[0];
  
    // Get questions for this election
    const questionsResult = await pool.query(
      "SELECT id, title FROM questions WHERE election_id = $1 ORDER BY id",
      [id]
    );
  
    // Initialize results structure
    const results = [];
  
    // For each question, get candidates and vote counts
    for (const question of questionsResult.rows) {
      // Get candidates for this question
      const candidatesResult = await pool.query(
        "SELECT c.id, c.candidate_name as name, c.image as photo, COUNT(v.id) as votes " +
        "FROM candidates c " +
        "LEFT JOIN votes v ON c.id = v.candidate_id AND v.question_id = $1 " +
        "WHERE c.question_id = $1 " +
        "GROUP BY c.id, c.candidate_name, c.image " +
        "ORDER BY c.id",
        [question.id]
      );
  
      // Add to results
      results.push({
        question_id: question.id,
        title: question.title,
        candidates: candidatesResult.rows.map((c) => ({
          id: c.id,
          name: c.name,
          votes: parseInt(c.votes || "0"),
          photo: c.photo,
        })),
      });
    }
  
    return {
      election_id: election.id,
      title: election.title,
      end_date: election.end_date,
      results,
    };
  };
  
  /**
   * Get demographic breakdown for a specific candidate
   * @param {number|string} electionId - Election ID
   * @param {number|string} questionId - Question ID
   * @param {number|string} candidateId - Candidate ID
   * @returns {Promise<Object>} Demographic data
   */
  export const getCandidateDemographics = async (electionId, questionId, candidateId) => {
    // Age demographics
    const ageQuery = `
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 18 AND 24 THEN '18-24'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 25 AND 34 THEN '25-34'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 35 AND 44 THEN '35-44'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 45 AND 54 THEN '45-54'
          WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 55 AND 64 THEN '55-64'
          ELSE '65+'
        END as age_group,
        COUNT(*) as count
      FROM votes v
      JOIN user_profiles up ON v.user_id = up.user_id
      WHERE v.election_id = $1 AND v.question_id = $2 AND v.candidate_id = $3
      GROUP BY age_group
      ORDER BY age_group
    `;
  
    const ageResult = await pool.query(ageQuery, [electionId, questionId, candidateId]);
  
    // Gender demographics
    const genderQuery = `
      SELECT up.gender, COUNT(*) as count
      FROM votes v
      JOIN user_profiles up ON v.user_id = up.user_id
      WHERE v.election_id = $1 AND v.question_id = $2 AND v.candidate_id = $3
      GROUP BY up.gender
      ORDER BY up.gender
    `;
  
    const genderResult = await pool.query(genderQuery, [electionId, questionId, candidateId]);
  
    // Education demographics
    const educationQuery = `
      SELECT up.education, COUNT(*) as count
      FROM votes v
      JOIN user_profiles up ON v.user_id = up.user_id
      WHERE v.election_id = $1 AND v.question_id = $2 AND v.candidate_id = $3
      GROUP BY up.education
      ORDER BY up.education
    `;
  
    const educationResult = await pool.query(educationQuery, [electionId, questionId, candidateId]);
  
    // Location demographics
    const locationQuery = `
      SELECT up.country, COUNT(*) as count
      FROM votes v
      JOIN user_profiles up ON v.user_id = up.user_id
      WHERE v.election_id = $1 AND v.question_id = $2 AND v.candidate_id = $3
      GROUP BY up.country
      ORDER BY count DESC
      LIMIT 10
    `;
  
    const locationResult = await pool.query(locationQuery, [electionId, questionId, candidateId]);
  
    // Occupation demographics
    const occupationQuery = `
      SELECT up.occupation, COUNT(*) as count
      FROM votes v
      JOIN user_profiles up ON v.user_id = up.user_id
      WHERE v.election_id = $1 AND v.question_id = $2 AND v.candidate_id = $3
      GROUP BY up.occupation
      ORDER BY count DESC
      LIMIT 10
    `;
  
    const occupationResult = await pool.query(occupationQuery, [electionId, questionId, candidateId]);
  
    // Convert query results to the required format
    const age = {};
    ageResult.rows.forEach((row) => {
      age[row.age_group] = parseInt(row.count);
    });
  
    const gender = {};
    genderResult.rows.forEach((row) => {
      gender[row.gender] = parseInt(row.count);
    });
  
    const education = {};
    educationResult.rows.forEach((row) => {
      education[row.education] = parseInt(row.count);
    });
  
    const location = {};
    locationResult.rows.forEach((row) => {
      location[row.country] = parseInt(row.count);
    });
  
    const occupation = {};
    occupationResult.rows.forEach((row) => {
      occupation[row.occupation] = parseInt(row.count);
    });
  
    return {
      age,
      gender,
      education,
      location,
      occupation,
    };
  };
  
  /**
   * Get voter turnout data
   * @param {number|string} electionId - Election ID
   * @returns {Promise<Object>} Voter turnout data
   */
  export const getVoterTurnout = async (electionId) => {
    // Get total eligible voters
    const totalVotersResult = await pool.query(
      "SELECT voters FROM elections WHERE id = $1",
      [electionId]
    );
  
    const totalVoters = parseInt(totalVotersResult.rows[0]?.voters || "0");
  
    // Get actual voters (distinct users who voted)
    const actualVotersResult = await pool.query(
      "SELECT COUNT(DISTINCT user_id) as count FROM votes WHERE election_id = $1",
      [electionId]
    );
  
    const actualVoters = parseInt(actualVotersResult.rows[0]?.count || "0");
  
    // Get turnout by age group
    const ageQuery = `
      WITH voters AS (
        SELECT DISTINCT v.user_id
        FROM votes v
        WHERE v.election_id = $1
      ),
      eligible AS (
        SELECT 
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 18 AND 24 THEN '18-24'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 25 AND 34 THEN '25-34'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 35 AND 44 THEN '35-44'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 45 AND 54 THEN '45-54'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 55 AND 64 THEN '55-64'
            ELSE '65+'
          END as age_group,
          COUNT(*) as eligible_count
        FROM user_profiles up
        GROUP BY age_group
      ),
      voted AS (
        SELECT 
          CASE 
            WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 18 AND 24 THEN '18-24'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 25 AND 34 THEN '25-34'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 35 AND 44 THEN '35-44'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 45 AND 54 THEN '45-54'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), up.dob)) BETWEEN 55 AND 64 THEN '55-64'
            ELSE '65+'
          END as age_group,
          COUNT(*) as voted_count
        FROM voters v
        JOIN user_profiles up ON v.user_id = up.user_id
        GROUP BY age_group
      )
      SELECT e.age_group, ROUND((COALESCE(v.voted_count, 0) * 100.0 / e.eligible_count)) as turnout_percentage
      FROM eligible e
      LEFT JOIN voted v ON e.age_group = v.age_group
      ORDER BY e.age_group
    `;
  
    const ageResult = await pool.query(ageQuery, [electionId]);
  
    // Gender turnout query
    const genderQuery = `
      WITH voters AS (
        SELECT DISTINCT v.user_id
        FROM votes v
        WHERE v.election_id = $1
      ),
      eligible AS (
        SELECT 
          up.gender,
          COUNT(*) as eligible_count
        FROM user_profiles up
        GROUP BY up.gender
      ),
      voted AS (
        SELECT 
          up.gender,
          COUNT(*) as voted_count
        FROM voters v
        JOIN user_profiles up ON v.user_id = up.user_id
        GROUP BY up.gender
      )
      SELECT e.gender, ROUND((COALESCE(v.voted_count, 0) * 100.0 / e.eligible_count)) as turnout_percentage
      FROM eligible e
      LEFT JOIN voted v ON e.gender = v.gender
      ORDER BY e.gender
    `;
  
    const genderResult = await pool.query(genderQuery, [electionId]);
  
    // Education turnout query
    const educationQuery = `
      WITH voters AS (
        SELECT DISTINCT v.user_id
        FROM votes v
        WHERE v.election_id = $1
      ),
      eligible AS (
        SELECT 
          up.education,
          COUNT(*) as eligible_count
        FROM user_profiles up
        GROUP BY up.education
      ),
      voted AS (
        SELECT 
          up.education,
          COUNT(*) as voted_count
        FROM voters v
        JOIN user_profiles up ON v.user_id = up.user_id
        GROUP BY up.education
      )
      SELECT e.education, ROUND((COALESCE(v.voted_count, 0) * 100.0 / e.eligible_count)) as turnout_percentage
      FROM eligible e
      LEFT JOIN voted v ON e.education = v.education
      ORDER BY e.education
    `;
  
    const educationResult = await pool.query(educationQuery, [electionId]);
  
    // Location turnout query
    const locationQuery = `
      WITH voters AS (
        SELECT DISTINCT v.user_id
        FROM votes v
        WHERE v.election_id = $1
      ),
      eligible AS (
        SELECT 
          up.country,
          COUNT(*) as eligible_count
        FROM user_profiles up
        GROUP BY up.country
      ),
      voted AS (
        SELECT 
          up.country,
          COUNT(*) as voted_count
        FROM voters v
        JOIN user_profiles up ON v.user_id = up.user_id
        GROUP BY up.country
      )
      SELECT e.country, ROUND((COALESCE(v.voted_count, 0) * 100.0 / e.eligible_count)) as turnout_percentage
      FROM eligible e
      LEFT JOIN voted v ON e.country = v.country
      ORDER BY turnout_percentage DESC
      LIMIT 10
    `;
  
    const locationResult = await pool.query(locationQuery, [electionId]);
  
    // Build the turnout data object
    const turnoutByDemographic = {
      age: {},
      gender: {},
      education: {},
      location: {},
    };
  
    // Fill in age data from query
    ageResult.rows.forEach((row) => {
      turnoutByDemographic.age[row.age_group] = parseInt(row.turnout_percentage);
    });
  
    // Fill in gender data from query
    genderResult.rows.forEach((row) => {
      turnoutByDemographic.gender[row.gender] = parseInt(row.turnout_percentage);
    });
  
    // Fill in education data from query
    educationResult.rows.forEach((row) => {
      turnoutByDemographic.education[row.education] = parseInt(row.turnout_percentage);
    });
  
    // Fill in location data from query
    locationResult.rows.forEach((row) => {
      turnoutByDemographic.location[row.country] = parseInt(row.turnout_percentage);
    });
  
    return {
      totalVoters,
      actualVoters,
      turnoutByDemographic,
    };
  };
  
  /**
   * Get votes by a specific user
   * @param {number|string} electionId - Election ID
   * @param {number|string} userId - User ID
   * @returns {Promise<Array>} User's votes
   */
  export const getUserVotes = async (electionId, userId) => {
    const result = await pool.query(
      `SELECT v.question_id, v.candidate_id, q.title as question_title, c.candidate_name 
       FROM votes v 
       JOIN questions q ON v.question_id = q.id 
       JOIN candidates c ON v.candidate_id = c.id 
       WHERE v.election_id = $1 AND v.user_id = $2`,
      [electionId, userId]
    );
    
    return result.rows;
  };

  
  /**
   * Record a vote
   * @param {number|string} electionId - Election ID
   * @param {number|string} questionId - Question ID
   * @param {number|string} candidateId - Candidate ID
   * @param {number|string} userId - User ID
   * @returns {Promise<Object>} Recorded vote
   */
  export const recordVote = async (electionId, questionId, candidateId, userId) => {
    // Check if user has already voted for this question in this election
    const existingVote = await pool.query(
      "SELECT * FROM votes WHERE election_id = $1 AND question_id = $2 AND user_id = $3",
      [electionId, questionId, userId]
    );
  
    if (existingVote.rows.length > 0) {
      // Update existing vote
      const result = await pool.query(
        "UPDATE votes SET candidate_id = $1, updated_at = CURRENT_TIMESTAMP WHERE election_id = $2 AND question_id = $3 AND user_id = $4 RETURNING *",
        [candidateId, electionId, questionId, userId]
      );
      return result.rows[0];
    } else {
      // Create new vote
      const result = await pool.query(
        "INSERT INTO votes (election_id, question_id, candidate_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [electionId, questionId, candidateId, userId]
      );
      return result.rows[0];
    }
  };