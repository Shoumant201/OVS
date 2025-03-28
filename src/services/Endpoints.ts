export const Endpoints = {
  ADMIN: {
    adminRegister: "/admin/adminRegister",
    adminLogin: "/admin/adminLogin", // Changed from "/admin/login" to match backend route
  },
  COMMISSIONER: {
    // Add this endpoint for fetching commissioners
    getCommissioners: '/admin/getCommissioners', // GET endpoint to fetch all commissioners
    addCommissioner: '/admin/commissioner', // POST endpoint to add a commissioner
    deleteCommissioner: '/admin/commissioner/:id', // DELETE endpoint with :id placeholder
  },
  PROFILE: {
    USER_PROFILE: "/admin/profile",
    UPDATE_PROFILE: "/admin/profile",
    UPDATE_PASSWORD: "/admin/password",
  }
}

