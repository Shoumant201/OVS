import pool from "../config/db.js";

export const voteCheck = async (userId, electionId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM votes WHERE user_id = $1 AND election_id = $2 LIMIT 1",
      [userId, electionId]
    );
    
    return result.rows.length > 0; // Return boolean indicating if vote exists
  } catch (error) {
    console.error("Error checking vote:", error);
    throw error;
  }
};

export const electionCheck = async (electionId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM elections WHERE id = $1 AND start_date <= NOW() AND end_date >= NOW()",
      [electionId]
    );
    
    return result.rows[0]; // Return the election if active, otherwise undefined
  } catch (error) {
    console.error("Error checking election:", error);
    throw error;
  }
};

export const insertVote = async (userId, electionId, questionId, candidateId) => {
  try {
    await pool.query(
      "INSERT INTO votes (user_id, election_id, question_id, candidate_id, created_at) VALUES ($1, $2, $3, $4, NOW())",
      [userId, electionId, questionId, candidateId]
    );
    
    return true; // Return success indicator
  } catch (error) {
    console.error("Error inserting vote:", error);
    throw error;
  }
};

export const getElectionResults = async (electionId) => {
  try {
    // Get questions for this election
    const questionsResult = await pool.query(
      "SELECT * FROM questions WHERE election_id = $1 ORDER BY id",
      [electionId]
    );
    
    const questions = questionsResult.rows;
    const results = [];
    
    // For each question, get candidates and vote counts
    for (const question of questions) {
      const candidatesResult = await pool.query(
        "SELECT * FROM candidates WHERE question_id = $1 ORDER BY id",
        [question.id]
      );
      
      const candidates = [];
      
      // Get vote count for each candidate
      for (const candidate of candidatesResult.rows) {
        const voteCountResult = await pool.query(
          "SELECT COUNT(*) FROM votes WHERE question_id = $1 AND candidate_id = $2",
          [question.id, candidate.id]
        );
        
        candidates.push({
          id: candidate.id,
          name: candidate.candidate_name,
          votes: parseInt(voteCountResult.rows[0].count)
        });
      }
      
      results.push({
        question_id: question.id,
        title: question.title,
        candidates: candidates
      });
    }
    
    return results;
  } catch (error) {
    console.error("Error getting election results:", error);
    throw error;
  }
};