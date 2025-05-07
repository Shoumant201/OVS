import { voteCheck, electionCheck, insertVote, getElectionResults, getDetailedElectionResults } from "../models/voteModel.js";
import pool from "../config/db.js";

export const checkVoteStatus = async (req, res) => {
  try {
    const { electionId } = req.params;
    const userId = req.user.id;

    const hasVoted = await voteCheck(userId, electionId);
    return res.json({ hasVoted });
  } catch (error) {
    console.error("Error checking vote status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const submitVote = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { election_id, votes } = req.body;
    const userId = req.user.id;
    
    // Start transaction
    await client.query("BEGIN");

    // Check if user has already voted in this election
    const hasVoted = await voteCheck(userId, election_id);
    
    if (hasVoted) {
      await client.query("ROLLBACK");
      return res.status(403).json({
        success: false,
        message: "User has already voted in this election"
      });
    }

    // Check if election is active
    const election = await electionCheck(election_id);
    
    if (!election) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Election is not active"
      });
    }

    // Insert votes
    for (const vote of votes) {
      await insertVote(
        userId, 
        election_id, 
        vote.question_id, 
        vote.candidate_id
      );
    }
    
    // Commit transaction
    await client.query("COMMIT");
    
    res.json({ 
      success: true, 
      message: "Votes submitted successfully" 
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error submitting vote:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  } finally {
    client.release();
  }
};

export const getResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    
    // Get election details
    const electionResult = await pool.query(
      "SELECT * FROM elections WHERE id = $1",
      [electionId]
    );
    
    if (electionResult.rows.length === 0) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    const election = electionResult.rows[0];
    const now = new Date();
    const endDate = new Date(election.end_date);
    
    // Only show results if election has ended or user is admin
    if (now < endDate && election.hide_result && req.user.role !== "admin") {
      return res.status(403).json({ 
        message: "Results are hidden until the election ends or the admin enables visibility" 
      });
    }
    
    
    // Get results
    const results = await getElectionResults(electionId);
    
    res.json({
      election_id: electionId,
      title: election.title,
      end_date: election.end_date,
      results: results
    });
  } catch (error) {
    console.error("Error getting election results:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};
export const getDetailedResults = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Get election details
    const electionResult = await pool.query(
      "SELECT * FROM elections WHERE id = $1",
      [electionId]
    );

    if (electionResult.rows.length === 0) {
      return res.status(404).json({ message: "Election not found" });
    }

    const election = electionResult.rows[0];
    // const now = new Date();
    // const endDate = new Date(election.end_date);

    // Authorization is primarily handled by isSuperAdmin middleware.
    // You might still want checks like if the election has ended, etc.
    // For simplicity here, we'll rely on middleware for access control.

    const detailedResultsData = await getDetailedElectionResults(electionId);

    res.json({
      election_id: electionId,
      title: election.title,
      end_date: election.end_date,
      results_published: election.results_published, // good to include status
      detailed_results: detailedResultsData,
    });
  } catch (error) {
    console.error("Error getting detailed election results:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};