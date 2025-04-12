import pool from "../config/db.js";

export const voteCheck = async (userId, electionId) => {
    try {
      const result = await pool.query(
        "SELECT * FROM votes WHERE user_id = $1 AND election_id = $2 LIMIT 1",
        [userId, electionId],
      )
  
      return result.rows[0]
    } catch (error) {
      console.error("Error checking vote:", error)
      throw error
    }
}

export const electionCheck = async (election_id) => {
    try{
        const result = await pool.query(
            "SELECT * FROM elections WHERE id = $1 AND start_date <= NOW() AND end_date >= NOW()",
            [election_id],
        )

        return result.rows[0]
    }catch (error) {
        console.error("Error checking vote:", error)
        throw error
    }
}

export const insertVote = async (userId, election_id, question_id, candidate_id) => {
    try{
        const result = await pool.query(
            "INSERT INTO votes (user_id, election_id, question_id, candidate_id, created_at) VALUES ($1, $2, $3, $4, NOW())",
            [userId, election_id, question_id, candidate_id],
        )

        return result.rows[0]
    } catch (err){
        console.error("Error checking vote:", err)
        throw err
    }
}
