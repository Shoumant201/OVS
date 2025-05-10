export const Endpoints = {
  ADMIN: {
    adminRegister: "/admin/adminRegister",
    adminLogin: "/admin/adminLogin", // Changed from "/admin/login" to match backend route
  },
  COMMISSIONER: {
    // Add this endpoint for fetching commissioners
    getCommissioners: "/admin/getCommissioners", // GET endpoint to fetch all commissioners
    addCommissioner: "/admin/commissioner", // POST endpoint to add a commissioner
    deleteCommissioner: "/admin/commissioner/:id", // DELETE endpoint with :id placeholder
  },
  PROFILE: {
    USER_PROFILE: "/admin/profile",
    UPDATE_PROFILE: "/admin/profile",
    UPDATE_PASSWORD: "/admin/password",
  },

  USER: {
    getUsers: "/admin/getUsers", // GET endpoint to fetch all users
    banUser: "/admin/users/:id/ban", // PUT endpoint to ban a user
    unbanUser: "/admin/users/:id/unban", // PUT endpoint to unban a user
    deleteUser: "/admin/delUser/:id", // DELETE endpoint to delete a user
  },

  ELECTION: {
    createElection: "/elections/createElection",
    getAllElection: "/elections/",
    getElectionByID: "/elections/:id",
    deleteElection: "/elections/:id",
    updateElection: "/elections/:id",
    updateVisibility: "/elections/:id/results-visibility",
    publishResult: "/elections/:id/publish",
    launchElection: "/elections/:id/launch",
    getVotersByElectionId: "/elections/getVotersByElectionId/:election_id",
    deleteVote: "/elections/deleteVote/:id",
  },

  BALLOT: {
    createQuestion: "/elections/createQuestion",
    createCandidate: "/elections/createCandidate",

    getAllQuestions: "/elections/getAllQuestions",
    getAllCandidates: "/elections/getAllCandidates",

    getQuestionByElectionId: "/elections/getAllQuestions/:id",
    getCandidateByQuestionId: "/elections/getAllCandidates/:id",

    deleteQuestion: "/elections/deleteQuestion/:id",
    deleteCandidate: "/elections/deleteCandidate/:id",

    updateQuestion: "/elections/updateQuestion/:id",
    updateCandidate: "/elections/updateCandidate/:id",
  },
}
