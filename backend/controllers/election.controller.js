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
} from "../models/election.model.js";
import { findUserById } from "../models/userModel.js";
import {validationResult} from "express-validator"
import pool from "../config/db.js";


// Create election
export const createElectionController = async (req, res) => {
    try {
        const { title, start_date, end_date } = req.body;
        const created_by = req.user.id; // Assuming `req.user` is populated by `protect` middleware
        const role = req.user.role; // Get the role from cookies

        console.log(role);
        
        // Check if the role exists in the cookies
        if (!role) {
            return res.status(400).json({
                success: false,
                message: 'User role not found in cookies',
            });
        }

        // Decide the column based on the user role
        let created_by_column;

        if (role === 'admin') {
            created_by_column = 'created_by_admin';
        } else if (role === 'commissioner') {
            created_by_column = 'created_by_commissioner';
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid user role in cookies',
            });
        }

        // Create the election with the appropriate created_by column
        const election = await createElection(
            title,
            start_date,
            end_date,
            created_by,
            created_by_column // Pass the column name dynamically
        );

        res.status(201).json({
            success: true,
            data: election,
            message: "Election created successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

export const createQuestionController = async (req, res) => {
    try {
        const { election_id, title, description, shuffle } = req.body;

        // Create the election with the appropriate created_by column
        const election = await createQuestion(
            election_id,
            title,
            description,
            shuffle,
        );

        res.status(201).json({
            success: true,
            data: election,
            message: "Question created successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
}

export const createCandidateController = async (req, res) => {
    try {
        const { question_id, candidate_name, candidate_bio, description, photo } = req.body;

        // Create the election with the appropriate created_by column
        const election = await createCandidate(
            question_id,
            candidate_name,
            candidate_bio,
            description,
            photo
        );

        res.status(201).json({
            success: true,
            data: election,
            message: "CAndidate created successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
}



// Get election by ID
export const getElectionByIdController = async (req, res) => {
    try {
        const {id} = req.params;
        const elections = await getElectionById(id);
        res.json(elections);
      } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
        console.error("Detailed error:", err); // Log the full error details
        res.status(500).json({ message: "Server error", error: err.message });
        
      }
};

// Get all elections
// export const getAllElectionsController = async (req, res) => {
//     try {
//         const elections = await getAllElections();

//         res.status(200).json({
//             success: true,
//             count: elections.length,
//             data: elections,
//         });
//     } catch (error) {
        
//         res.status(500).json({ message: "Server error", error: err.message })
//         res.status(500).json({
//             success: false,
//             message: "Server error",
//             error: error.message,
//         });
//     }
// };

export const getAllElectionsController = async (req, res) => {
  try {
    const elections = await getAllElections();
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
    console.error("Detailed error:", err); // Log the full error details
    res.status(500).json({ message: "Server error", error: err.message });
    
  }
};

export const getUserElectionsController = async (req, res) => {
  try {
    const elections = await getUserElections();
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
    console.error("Detailed error:", err); // Log the full error details
    res.status(500).json({ message: "Server error", error: err.message });
    
  }
};

export const getAllQuestionsController = async (req, res) => {
    try {
      const elections = await getAllQuestions();
      res.json(elections);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message })
      console.error("Detailed error:", err); // Log the full error details
      res.status(500).json({ message: "Server error", error: err.message });
      
    }
  };

  export const getAllCandidatesController = async (req, res) => {
    try {
      const elections = await getAllCandidates();
      res.json(elections);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message })
      console.error("Detailed error:", err); // Log the full error details
      res.status(500).json({ message: "Server error", error: err.message });
      
    }
  };

  export const getQuestionByElectionIdController = async (req, res) => {
    try {
        const {id} = req.params;
        const elections = await getQuestionByElectionId(id);
        res.json(elections);
      } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
        console.error("Detailed error:", err); // Log the full error details
        res.status(500).json({ message: "Server error", error: err.message });
        
      }
};

export const getCandidatesByQuestionIdController = async (req, res) => {
    try {
        const {id} = req.params;
        const elections = await getCandidateByQuestionId(id);
        res.json(elections);
      } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
        console.error("Detailed error:", err); // Log the full error details
        res.status(500).json({ message: "Server error", error: err.message });
        
      }
};



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
      const { id } = req.params;
      const updateFields = req.body;
  
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: "No data provided to update." });
      }
  
      const election = await updateElection(id, updateFields);
      res.json(election);
    } catch (err) {
      console.error("Detailed error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  

export const deleteElectionController = async (req, res) => {
    try {
        const {id} = req.params;
      const elections = await deleteElection(id);
      res.json(elections);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message })
      console.error("Detailed error:", err); // Log the full error details
      res.status(500).json({ message: "Server error", error: err.message });
      
    }
  };

  export const deleteQuestionController = async (req, res) => {
    try {
        const {id} = req.params;
      const elections = await deleteQuestion(id);
      res.json(elections);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message })
      console.error("Detailed error:", err); // Log the full error details
      res.status(500).json({ message: "Server error", error: err.message });
      
    }
  };

  export const deleteCandidateController = async (req, res) => {
    try {
        const {id} = req.params;
      const elections = await deleteCandidate(id);
      res.json(elections);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message })
      console.error("Detailed error:", err); // Log the full error details
      res.status(500).json({ message: "Server error", error: err.message });
      
    }
  };

  export const updateQuestionController = async (req, res) => {
    try {
      const { id } = req.params;
      const updateFields = req.body;
  
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: "No data provided to update." });
      }
  
      const election = await updateQuestion(id, updateFields);
      res.json(election);
    } catch (err) {
      console.error("Detailed error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };

  export const updateCandidateController = async (req, res) => {
    try {
      const { id } = req.params;
      const updateFields = req.body;
  
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: "No data provided to update." });
      }
  
      const election = await updateCandidate(id, updateFields);
      res.json(election);
    } catch (err) {
      console.error("Detailed error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };



export const getUsersInElectionController = async (req, res) => {
    try {
        const { id } = req.params;
        const users = await getUsersInElection(id);
        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

export const registerUserForElectionController = async (req, res) => {
    try {
        const { electionId } = req.params;
        const userId = req.user.id; // The currently logged in user

        // Check if the election exists
        const election = await getElectionById(electionId);
        if (!election) {
            return res.status(404).json({
                success: false,
                message: "Election not found",
            });
        }

        // Register the user for the election
        const registration = await registerUserForElection(electionId, userId);

        res.status(201).json({
            success: true,
            data: registration,
            message: "User registered for election successfully",
        });
    } catch (error) {
        //Specific Error Message if any Error occurred due to already registered in the same election
        if (error.message === "User already registered for this election") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

//Unregister user
export const unregisterUserForElectionController = async (req, res) => {
    try {
        const { electionId } = req.params;
        const userId = req.user.id;

        const election = await getElectionById(electionId);
        if (!election) {
            return res.status(404).json({
                success: false,
                message: "Election not found",
            });
        }

        await unregisterUserForElection(electionId, userId);

        res.status(200).json({
            success: true,
            message: "User unregistered from election successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

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
    const userCheck = await pool.query(
      "SELECT * FROM elections WHERE (id = $1)",
      [id],
    )

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
    const userCheck = await pool.query(
      "SELECT * FROM elections WHERE (id = $1)",
      [id],
    )

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
