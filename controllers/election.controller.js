import {
    createElection,
    getElectionById,
    getAllElections,
    updateElection,
    deleteElection,
    getUsersInElection,
    registerUserForElection,
    unregisterUserForElection,
} from "../models/election.model.js";
import { findUserById } from "../models/userModel.js";

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



// Get election by ID
export const getElectionByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const election = await getElectionById(id);

        if (!election) {
            return res.status(404).json({
                success: false,
                message: "Election not found",
            });
        }

        res.status(200).json({
            success: true,
            data: election,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
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

// Update election
export const updateElectionController = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, start_date, end_date } = req.body;

        const election = await updateElection(id, title, description, start_date, end_date);

        if (!election) {
            return res.status(404).json({
                success: false,
                message: "Election not found",
            });
        }

        res.status(200).json({
            success: true,
            data: election,
            message: "Election updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

// Delete election
export const deleteElectionController = async (req, res) => {
    try {
        const { id } = req.params;

        await deleteElection(id);

        res.status(200).json({
            success: true,
            message: "Election deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
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