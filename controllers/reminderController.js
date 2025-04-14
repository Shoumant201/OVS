import { schedule } from "node-cron"
import pool from "../config/db.js"
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

// Store scheduled jobs to be able to cancel them if needed
const scheduledJobs = new Map()

// Create a transporter for sending emails
let transporter
try {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Add timeout to prevent hanging
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  })
} catch (error) {
  console.error("Error creating email transporter:", error)
}

// Helper function to add timeout to database queries
const queryWithTimeout = async (query, params, timeoutMs = 5000) => {
  const queryPromise = pool.query(query, params)
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Database query timed out")), timeoutMs),
  )

  return Promise.race([queryPromise, timeoutPromise])
}

// Set a reminder for an election
export const setElectionReminder = async (req, res) => {
  console.log("1. setElectionReminder called")
  const { electionId } = req.params
  console.log("2. Election ID:", electionId)

  try {
    // User should be attached to req by the middleware
    const user = req.user
    console.log("3. User:", user ? user.id : "none")

    if (!user || !user.email) {
      return res.status(401).json({ message: "User not authenticated or email not available" })
    }

    console.log("4. Querying election details")
    // Get election details with timeout
    const electionResult = await queryWithTimeout("SELECT * FROM elections WHERE id = $1", [electionId])
    console.log("5. Election query complete")

    if (electionResult.rows.length === 0) {
      return res.status(404).json({ message: "Election not found" })
    }

    const election = electionResult.rows[0]
    const startDate = new Date(election.start_date)
    console.log("6. Election start date:", startDate)

    // Check if election has already started
    if (new Date() >= startDate) {
      return res.status(400).json({ message: "Cannot set reminder for an election that has already started" })
    }

    console.log("7. Saving reminder to database")
    // Save reminder in database with timeout
    const reminderResult = await queryWithTimeout(
      "INSERT INTO election_reminders (user_id, election_id, email, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [user.id, electionId, user.email],
    )
    console.log("8. Reminder saved to database")

    const reminder = reminderResult.rows[0]

    // Schedule the reminder email in a non-blocking way
    console.log("9. Scheduling reminder email")
    setTimeout(() => {
      try {
        scheduleReminderEmail(reminder.id, user.email, election, startDate)
        console.log("10. Reminder email scheduled")
      } catch (err) {
        console.error("Error scheduling reminder email:", err)
      }
    }, 0)

    console.log("11. Sending success response")
    return res.json({
      success: true,
      message: "Reminder set successfully",
      reminder: {
        id: reminder.id,
        electionId,
        email: user.email,
        electionTitle: election.title,
        startDate: election.start_date,
      },
    })
  } catch (err) {
    console.error("Error setting election reminder:", err)
    return res.status(500).json({ message: "Server error", error: err.message })
  }
}

// Function to schedule a reminder email
function scheduleReminderEmail(reminderId, email, election, startDate) {
  try {
    // Calculate when to send the reminder (e.g., 1 hour before election starts)
    const reminderTime = new Date(startDate.getTime() - 60 * 60 * 1000) // 1 hour before

    // If reminder time is in the past, send immediately but don't block
    if (reminderTime <= new Date()) {
      setTimeout(() => {
        sendReminderEmail(email, election).catch((err) => {
          console.error("Error sending immediate reminder email:", err)
        })
      }, 0)
      return
    }

    // Schedule the reminder
    const job = schedule(
      `${reminderTime.getMinutes()} ${reminderTime.getHours()} ${reminderTime.getDate()} ${
        reminderTime.getMonth() + 1
      } *`,
      () => {
        sendReminderEmail(email, election).catch((err) => {
          console.error("Error sending scheduled reminder email:", err)
        })
        // Remove job from map after execution
        scheduledJobs.delete(reminderId)
      },
      {
        scheduled: true,
        timezone: "UTC",
      },
    )

    // Store the job for potential cancellation
    scheduledJobs.set(reminderId, job)
  } catch (err) {
    console.error("Error in scheduleReminderEmail:", err)
    // Don't throw the error, just log it
  }
}

// Function to send the reminder email
async function sendReminderEmail(email, election) {
  if (!transporter) {
    console.error("Email transporter not initialized")
    return
  }

  const startDate = new Date(election.start_date)
  const formattedDate = startDate.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  })

  const mailOptions = {
    from: `"Election Runner" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: email,
    subject: `Reminder: ${election.title} starts soon`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Election Reminder</h2>
        <p>Hello,</p>
        <p>This is a reminder that the election <strong>${election.title}</strong> is starting soon.</p>
        <p><strong>Start Time:</strong> ${formattedDate}</p>
        <p>Please make sure to cast your vote before the election ends.</p>
        <p>
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/elections/${election.id}" 
             style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">
            Go to Election
          </a>
        </p>
        <p>Thank you for participating!</p>
        <p>- The Election Runner Team</p>
      </div>
    `,
  }

  try {
    // Add timeout to email sending
    const sendPromise = transporter.sendMail(mailOptions)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email sending timed out")), 10000),
    )

    await Promise.race([sendPromise, timeoutPromise])
    console.log(`Reminder email sent to ${email} for election ${election.id}`)
  } catch (error) {
    console.error(`Error sending reminder email to ${email}:`, error)
    // Don't throw the error, just log it
  }
}
