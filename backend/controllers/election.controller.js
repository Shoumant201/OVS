import {
  createElection,
  getElectionById,
  getAllElections,
  updateElection,
  deleteElection,
  getUsersInElection,
  registerUserForElection,
  unregisterUserForElection,
  createQuestion,
  createCandidate,
  getAllQuestions,
  getAllCandidates,
  getQuestionByElectionId,
  getCandidateByQuestionId,
  deleteQuestion,
  deleteCandidate,
  updateQuestion,
  updateCandidate,
  getUserElections,
  getCandidateDemographics,
  getVoterTurnout,
} from "../models/election.model.js"
import { validationResult } from "express-validator"
import pool from "../config/db.js"

// Keep all your existing controller functions

// Add these new controller functions for demographic analysis

/**
 * Get election results with vote counts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getElectionResultsController = async (req, res) => {
  try {
    const { id } = req.params

    // Get election details
    const electionResult = await pool.query("SELECT id, title, description, end_date FROM elections WHERE id = $1", [
      id,
    ])

    if (electionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      })
    }

    const election = electionResult.rows[0]

    // Get questions for this election
    const questionsResult = await pool.query("SELECT id, title FROM questions WHERE election_id = $1 ORDER BY id", [id])

    // Initialize results structure
    const results = []

    // For each question, get candidates and vote counts
    for (const question of questionsResult.rows) {
      // Get candidates for this question
      const candidatesResult = await pool.query(
        "SELECT o.id, o.candidate_name as name, o.image, COUNT(v.id) as votes " +
          "FROM candidates o " +
          "LEFT JOIN votes v ON o.id = v.candidate_id AND v.question_id = $1 " +
          "WHERE o.question_id = $1 " +
          "GROUP BY o.id, o.candidate_name, o.image " +
          "ORDER BY o.id",
        [question.id],
      )

      // Add to results
      results.push({
        question_id: question.id,
        title: question.title,
        candidates: candidatesResult.rows.map((c) => ({
          id: c.id,
          name: c.name,
          votes: Number.parseInt(c.votes || "0"),
          photo: c.photo,
        })),
      })
    }

    return res.status(200).json({
      success: true,
      election_id: election.id,
      title: election.title,
      end_date: election.end_date,
      results,
    })
  } catch (error) {
    console.error("Error getting election results:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

/**
 * Get demographic data for a specific candidate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCandidateDemographicsController = async (req, res) => {
  try {
    const { electionId, questionId, candidateId } = req.params
    const demographics = await getCandidateDemographics(electionId, questionId, candidateId)

    // Return data in the structure expected by the frontend
    res.status(200).json({
      success: true,
      data: demographics,
    })
  } catch (error) {
    console.error("Error getting candidate demographics:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

/**
 * Get voter turnout data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getVoterTurnoutController = async (req, res) => {
  try {
    const { id } = req.params
    const turnoutData = await getVoterTurnout(id)

    // Calculate turnout percentage
    const turnoutPercentage =
      turnoutData.totalVoters > 0 ? Math.round((turnoutData.actualVoters / turnoutData.totalVoters) * 100) : 0

    // Return data in the structure expected by the frontend
    res.status(200).json({
      success: true,
      data: {
        ...turnoutData,
        turnoutPercentage,
      },
    })
  } catch (error) {
    console.error("Error getting voter turnout:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

/**
 * Get votes by a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserVotesController = async (req, res) => {
  try {
    const { electionId } = req.params
    const userId = req.user.id // Get the user ID from the authenticated user

    // Verify the election exists
    const electionCheck = await pool.query("SELECT id FROM elections WHERE id = $1", [electionId])

    if (electionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      })
    }

    // Get the user's votes for this election
    const votesQuery = `
      SELECT v.question_id, v.candidate_id, q.title as question_title, o.candidate_name
      FROM votes v
      JOIN questions q ON v.question_id = q.id
      JOIN candidates o ON v.candidate_id = o.id
      WHERE v.election_id = $1 AND v.user_id = $2
      ORDER BY q.id
    `

    const votesResult = await pool.query(votesQuery, [electionId, userId])

    return res.status(200).json({
      success: true,
      data: votesResult.rows,
      message: "User votes retrieved successfully",
    })
  } catch (error) {
    console.error("Error getting user votes:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

/**
 * Record a vote
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const recordVoteController = async (req, res) => {
  try {
    const { electionId, questionId, candidateId } = req.body
    const userId = req.user.id // Get the user ID from the authenticated user

    // Validate required fields
    if (!electionId || !questionId || !candidateId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: electionId, questionId, or candidateId",
      })
    }

    // Check if the election exists
    const electionResult = await pool.query("SELECT id, start_date, end_date FROM elections WHERE id = $1", [
      electionId,
    ])

    if (electionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      })
    }

    // Check if the election is active
    const election = electionResult.rows[0]
    const now = new Date()
    const startDate = new Date(election.start_date)
    const endDate = new Date(election.end_date)

    if (now < startDate) {
      return res.status(400).json({
        success: false,
        message: "Voting has not started yet for this election",
      })
    }

    if (now > endDate) {
      return res.status(400).json({
        success: false,
        message: "Voting has ended for this election",
      })
    }

    // Check if the question belongs to the election
    const questionResult = await pool.query("SELECT id FROM questions WHERE id = $1 AND election_id = $2", [
      questionId,
      electionId,
    ])

    if (questionResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Question does not belong to this election",
      })
    }

    // Check if the candidate belongs to the question
    const candidateResult = await pool.query("SELECT id FROM candidates WHERE id = $1 AND question_id = $2", [
      candidateId,
      questionId,
    ])

    if (candidateResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Candidate does not belong to this question",
      })
    }

    // Check if the user has already voted for this question
    const existingVoteResult = await pool.query(
      "SELECT id FROM votes WHERE election_id = $1 AND question_id = $2 AND user_id = $3",
      [electionId, questionId, userId],
    )

    if (existingVoteResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already voted for this question",
      })
    }

    // Record the vote
    const insertResult = await pool.query(
      "INSERT INTO votes (election_id, question_id, candidate_id, user_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
      [electionId, questionId, candidateId, userId],
    )

    return res.status(201).json({
      success: true,
      data: {
        id: insertResult.rows[0].id,
        electionId,
        questionId,
        candidateId,
        userId,
      },
      message: "Vote recorded successfully",
    })
  } catch (error) {
    console.error("Error recording vote:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

/**
 * Export election results to CSV
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportElectionResultsController = async (req, res) => {
  try {
    const { id } = req.params
    const { format = "csv" } = req.query // Default to CSV if not specified

    // Get election details
    const electionResult = await pool.query("SELECT id, title, description, end_date FROM elections WHERE id = $1", [
      id,
    ])

    if (electionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      })
    }

    const election = electionResult.rows[0]

    // Get questions for this election
    const questionsResult = await pool.query("SELECT id, title FROM questions WHERE election_id = $1 ORDER BY id", [id])

    // Initialize results structure
    const results = []

    // For each question, get candidates and vote counts
    for (const question of questionsResult.rows) {
      // Get candidates for this question
      const candidatesResult = await pool.query(
        "SELECT o.id, o.candidate_name as name, COUNT(v.id) as votes " +
          "FROM candidates o " +
          "LEFT JOIN votes v ON o.id = v.candidate_id AND v.question_id = $1 " +
          "WHERE o.question_id = $1 " +
          "GROUP BY o.id, o.candidate_name " +
          "ORDER BY o.id",
        [question.id],
      )

      // Add to results
      results.push({
        question_id: question.id,
        title: question.title,
        candidates: candidatesResult.rows.map((c) => ({
          id: c.id,
          name: c.name,
          votes: Number.parseInt(c.votes || "0"),
        })),
      })
    }

    if (format.toLowerCase() === "csv") {
      // Generate CSV content
      let csvContent = "Question,Candidate,Votes\n"

      results.forEach((question) => {
        question.candidates.forEach((candidate) => {
          csvContent += `"${question.title}","${candidate.name}",${candidate.votes}\n`
        })
      })

      // Set headers for CSV download
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", `attachment; filename="election-${id}-results.csv"`)

      // Send the CSV content
      return res.send(csvContent)
    } else if (format.toLowerCase() === "json") {
      // Just return the JSON results
      return res.json({
        success: true,
        election_id: election.id,
        title: election.title,
        end_date: election.end_date,
        results,
      })
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported export format. Supported formats: csv, json",
      })
    }
  } catch (error) {
    console.error("Error exporting election results:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

/**
 * Export demographic data to CSV
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const exportDemographicDataController = async (req, res) => {
  try {
    const { electionId } = req.params
    const { format = "csv" } = req.query // Default to CSV if not specified

    // Verify the election exists
    const electionCheck = await pool.query("SELECT id, title FROM elections WHERE id = $1", [electionId])

    if (electionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      })
    }

    const election = electionCheck.rows[0]

    // Get voter turnout data
    // Get actual voters (distinct users who voted)
    const actualVotersResult = await pool.query(
      "SELECT COUNT(DISTINCT user_id) as count FROM votes WHERE election_id = $1",
      [electionId],
    )

    const actualVoters = Number.parseInt(actualVotersResult.rows[0]?.count || "0")

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
`

    const ageResult = await pool.query(ageQuery, [electionId])

    // Gender demographics query
    const genderQuery = `
      WITH voters AS (
        SELECT DISTINCT v.user_id
        FROM votes v
        WHERE v.election_id = $1
      ),
      eligible AS (
        SELECT 
          gender,
          COUNT(*) as eligible_count
        FROM user_profiles
        GROUP BY gender
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
    `

    const genderResult = await pool.query(genderQuery, [electionId])


    // Education demographics query
    const educationQuery = `
      WITH voters AS (
        SELECT DISTINCT v.user_id
        FROM votes v
        WHERE v.election_id = $1
      ),
      eligible AS (
        SELECT 
          education,
          COUNT(*) as eligible_count
        FROM user_profiles
        GROUP BY education
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
    `

    const educationResult = await pool.query(educationQuery, [electionId])

    // Location demographics query
    const locationQuery = `
      WITH voters AS (
        SELECT DISTINCT v.user_id
        FROM votes v
        WHERE v.election_id = $1
      ),
      eligible AS (
        SELECT 
          country,
          COUNT(*) as eligible_count
        FROM user_profiles
        GROUP BY country
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
    `

    const locationResult = await pool.query(locationQuery, [electionId])

    // Prepare demographic data
    const demographicData = {
      age: {},
      gender: {},
      education: {},
      location: {},
    }

    // Fill in data from queries
    ageResult.rows.forEach((row) => {
      demographicData.age[row.age_group] = Number.parseInt(row.turnout_percentage)
    })

    genderResult.rows.forEach((row) => {
      demographicData.gender[row.gender] = Number.parseInt(row.turnout_percentage)
    })

    educationResult.rows.forEach((row) => {
      demographicData.education[row.education] = Number.parseInt(row.turnout_percentage)
    })

    locationResult.rows.forEach((row) => {
      demographicData.location[row.country] = Number.parseInt(row.turnout_percentage)
    })

    if (format.toLowerCase() === "csv") {
      // Generate CSV content for turnout by demographic
      let csvContent = "Category,Group,Value\n"

      // Add age data
      Object.entries(demographicData.age).forEach(([ageGroup, percentage]) => {
        csvContent += `"Age","${ageGroup}",${percentage}\n`
      })

      // Add gender data
      Object.entries(demographicData.gender).forEach(([gender, percentage]) => {
        csvContent += `"Gender","${gender}",${percentage}\n`
      })

      // Add education data
      Object.entries(demographicData.education).forEach(([education, percentage]) => {
        csvContent += `"Education","${education}",${percentage}\n`
      })

      // Add location data
      Object.entries(demographicData.location).forEach(([location, percentage]) => {
        csvContent += `"Location","${location}",${percentage}\n`
      })

      // Set headers for CSV download
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", `attachment; filename="election-${electionId}-demographics.csv"`)

      // Send the CSV content
      return res.send(csvContent)
    } else if (format.toLowerCase() === "json") {
      // Just return the JSON results
      return res.json({
        success: true,
        election_id: election.id,
        title: election.title,
        data: {
          actualVoters,
          demographicData,
        },
      })
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported export format. Supported formats: csv, json",
      })
    }
  } catch (error) {
    console.error("Error exporting demographic data:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Create election
export const createElectionController = async (req, res) => {
  try {
    const { title, start_date, end_date } = req.body
    const created_by = req.user.id // Assuming `req.user` is populated by `protect` middleware
    const role = req.user.role // Get the role from cookies

    console.log(role)

    // Check if the role exists in the cookies
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "User role not found in cookies",
      })
    }

    // Decide the column based on the user role
    let created_by_column

    if (role === "admin") {
      created_by_column = "created_by_admin"
    } else if (role === "commissioner") {
      created_by_column = "created_by_commissioner"
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid user role in cookies",
      })
    }

    // Create the election with the appropriate created_by column
    const election = await createElection(
      title,
      start_date,
      end_date,
      created_by,
      created_by_column, // Pass the column name dynamically
    )

    res.status(201).json({
      success: true,
      data: election,
      message: "Election created successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

export const createQuestionController = async (req, res) => {
  try {
    const { election_id, title, description, shuffle } = req.body

    // Create the election with the appropriate created_by column
    const election = await createQuestion(election_id, title, description, shuffle)

    res.status(201).json({
      success: true,
      data: election,
      message: "Question created successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

export const createCandidateController = async (req, res) => {
  try {
    const { question_id, candidate_name, candidate_bio, description, photo } = req.body

    // Create the election with the appropriate created_by column
    const election = await createCandidate(question_id, candidate_name, candidate_bio, description, photo)

    res.status(201).json({
      success: true,
      data: election,
      message: "CAndidate created successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get election by ID
export const getElectionByIdController = async (req, res) => {
  try {
    const { id } = req.params
    const elections = await getElectionById(id)
    res.json(elections)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
    console.error("Detailed error:", err) // Log the full error details
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

export const getAllElectionsController = async (req, res) => {
  try {
    const elections = await getAllElections()
    res.json(elections)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
    console.error("Detailed error:", err) // Log the full error details
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

export const getUserElectionsController = async (req, res) => {
  try {
    const elections = await getUserElections()
    res.json(elections)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
    console.error("Detailed error:", err) // Log the full error details
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

export const getAllQuestionsController = async (req, res) => {
  try {
    const elections = await getAllQuestions()
    res.json(elections)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
    console.error("Detailed error:", err) // Log the full error details
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

export const getAllCandidatesController = async (req, res) => {
  try {
    const elections = await getAllCandidates()
    res.json(elections)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
    console.error("Detailed error:", err) // Log the full error details
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

export const getQuestionByElectionIdController = async (req, res) => {
  try {
    const { id } = req.params
    const elections = await getQuestionByElectionId(id)
    res.json(elections)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
    console.error("Detailed error:", err) // Log the full error details
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

export const getCandidatesByQuestionIdController = async (req, res) => {
  try {
    const { id } = req.params
    const elections = await getCandidateByQuestionId(id)
    res.json(elections)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
    console.error("Detailed error:", err) // Log the full error details
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

// Update election
// export const updateElectionController = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { title, description, start_date, end_date } = req.body;

//         const election = await updateElection(id, title, description, start_date, end_date);

//         if (!election) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Election not found",
//             });
//         }

//         res.status(200).json({
//             success: true,
//             data: election,
//             message: "Election updated successfully",
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "Server error",
//             error: error.message,
//         });
//     }
// };

export const updateElectionController = async (req, res) => {
  try {
    const { id } = req.params
    const updateFields = req.body

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No data provided to update." })
    }

    const election = await updateElection(id, updateFields)
    res.json(election)
  } catch (err) {
    console.error("Detailed error:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

export const deleteElectionController = async (req, res) => {
  try {
    const { id } = req.params
    const elections = await deleteElection(id)
    res.json(elections)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
    console.error("Detailed error:", err) // Log the full error details
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

export const deleteQuestionController = async (req, res) => {
  try {
    const { id } = req.params
    const elections = await deleteQuestion(id)
    res.json(elections)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
    console.error("Detailed error:", err) // Log the full error details
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

export const deleteCandidateController = async (req, res) => {
  try {
    const { id } = req.params
    const elections = await deleteCandidate(id)
    res.json(elections)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
    console.error("Detailed error:", err) // Log the full error details
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

export const updateQuestionController = async (req, res) => {
  try {
    const { id } = req.params
    const updateFields = req.body

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No data provided to update." })
    }

    const election = await updateQuestion(id, updateFields)
    res.json(election)
  } catch (err) {
    console.error("Detailed error:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

export const updateCandidateController = async (req, res) => {
  try {
    const { id } = req.params
    const updateFields = req.body

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No data provided to update." })
    }

    const election = await updateCandidate(id, updateFields)
    res.json(election)
  } catch (err) {
    console.error("Detailed error:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

export const getUsersInElectionController = async (req, res) => {
  try {
    const { id } = req.params
    const users = await getUsersInElection(id)
    res.status(200).json({
      success: true,
      data: users,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

export const registerUserForElectionController = async (req, res) => {
  try {
    const { electionId } = req.params
    const userId = req.user.id // The currently logged in user

    // Check if the election exists
    const election = await getElectionById(electionId)
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      })
    }

    // Register the user for the election
    const registration = await registerUserForElection(electionId, userId)

    res.status(201).json({
      success: true,
      data: registration,
      message: "User registered for election successfully",
    })
  } catch (error) {
    //Specific Error Message if any Error occurred due to already registered in the same election
    if (error.message === "User already registered for this election") {
      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

//Unregister user
export const unregisterUserForElectionController = async (req, res) => {
  try {
    const { electionId } = req.params
    const userId = req.user.id

    const election = await getElectionById(electionId)
    if (!election) {
      return res.status(404).json({
        success: false,
        message: "Election not found",
      })
    }

    await unregisterUserForElection(electionId, userId)

    res.status(200).json({
      success: true,
      message: "User unregistered from election successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

export const updateResultsVisibility = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { id } = req.params
  const { hide_result } = req.body
  const userId = req.user.id

  try {
    // Update the election's hide_results setting
    const result = await pool.query(
      "UPDATE elections SET hide_result = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [hide_result, id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Election not found" })
    }

    res.json({
      success: true,
      message: "Results visibility updated successfully",
      election: result.rows[0],
    })
  } catch (err) {
    console.error("Error updating results visibility:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

// Publish election results
export const publishElectionResults = async (req, res) => {
  const { id } = req.params

  try {
    // Check if user is admin or commissioner for this election
    const userCheck = await pool.query("SELECT * FROM elections WHERE (id = $1)", [id])

    if (userCheck.rows.length === 0) {
      return res.status(403).json({ message: "You don't have permission to publish results for this election" })
    }

    // Check if election has ended
    const election = userCheck.rows[0]
    const now = new Date()
    const endDate = new Date(election.end_date)

    if (now < endDate) {
      return res.status(400).json({ message: "Cannot publish results before the election has ended" })
    }

    // Update the election to publish results
    const result = await pool.query(
      "UPDATE elections SET results_published = true, updated_at = NOW() WHERE id = $1 RETURNING *",
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Election not found" })
    }

    res.json({
      success: true,
      message: "Election results published successfully",
      election: result.rows[0],
    })
  } catch (err) {
    console.error("Error publishing election results:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

export const launchElection = async (req, res) => {
  const { id } = req.params

  try {
    // Check if user is admin or commissioner for this election
    const userCheck = await pool.query("SELECT * FROM elections WHERE (id = $1)", [id])

    if (userCheck.rows.length === 0) {
      return res.status(403).json({ message: "You don't have permission to publish results for this election" })
    }

    // Check if election has ended
    const election = userCheck.rows[0]
    const now = new Date()
    const endDate = new Date(election.end_date)

    if (now < endDate) {
      return res.status(400).json({ message: "Cannot publish results before the election has ended" })
    }

    // Update the election to publish results
    const result = await pool.query(
      "UPDATE elections SET launched = true, updated_at = NOW() WHERE id = $1 RETURNING *",
      [id],
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Election not found" })
    }

    res.json({
      success: true,
      message: "Election results published successfully",
      election: result.rows[0],
    })
  } catch (err) {
    console.error("Error publishing election results:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
}
