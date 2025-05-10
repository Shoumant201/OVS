  // Base API endpoints
  const ENDPOINTS = {
    // Auth endpoints
    AUTH: {
      REGISTER: "/auth/register",
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      VERIFY_EMAIL: "/auth/verify/:token",
      FORGOT_PASSWORD: "/auth/forgot-password",
      RESET_PASSWORD: "/auth/reset-password/:token",
      CREATE_USERPROFILE: "/auth/createUserProfile",
      SETUP_2FA: "/auth/enable2FA",
      ENABLE_ONBOARDING: "/auth/onboarding",
      VERIFY_OTP: "/auth/verify-otp",
      RESEND_OTP: "/auth/resend-otp",
      verifyPassword: "/auth/verify-password",
      // GOOGLE: "/auth/google",
      // GOOGLE_CALLBACK: "/auth/google/callback",

      getProfile: "/auth/profile/:id",
      updateProfile: "/auth/profile/:id",
    },

    ELECTION: {
      getUserElections: "/auth/getUserElections",
      getElectionById: "/auth/:id",
      getQuestionsByElectionId: "/auth/getAllQuestions/:id",
      getCandidatesByQuestionId: "/auth/getAllCandidates/:id"
    },

    VOTE: {
      checkVote: "/vote/status/:electionId",
      submitVote: "/vote/",
      getResults: "/vote/elections/:electionId/results"
    },

    REMINDER: {
      setReminder: "/remind/elections/:electionId/reminder",
      cancelReminder: "/remind/:reminderId",
      getAllReminder: "/remind/"
    }

  }

  export default ENDPOINTS