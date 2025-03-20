import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import dotenv from "dotenv"
import pool from "./db.config.js"

dotenv.config()

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        const existingUser = await pool.query("SELECT * FROM users WHERE google_id = $1 OR email = $2", [
          profile.id,
          profile.emails[0].value,
        ])

        if (existingUser.rows.length > 0) {
          // If user exists but doesn't have google_id (registered with email)
          if (!existingUser.rows[0].google_id) {
            await pool.query("UPDATE users SET google_id = $1 WHERE email = $2", [profile.id, profile.emails[0].value])
          }
          return done(null, existingUser.rows[0])
        }

        // Create new user
        const newUser = await pool.query(
          "INSERT INTO users (email, password, is_verified, google_id) VALUES ($1, $2, $3, $4) RETURNING *",
          [profile.emails[0].value, "GOOGLE_AUTH", true, profile.id],
        )

        return done(null, newUser.rows[0])
      } catch (error) {
        return done(error, null)
      }
    },
  ),
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [id])
    done(null, user.rows[0])
  } catch (error) {
    done(error, null)
  }
})

export default passport

