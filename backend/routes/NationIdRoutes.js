import express from "express";
const router = express.Router()
import multer from "multer";
import { NationalIdController } from "../controllers/NationalIdController.js"

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === "application/pdf") {
      cb(null, true)
    } else {
      cb(new Error("Only PDF files are allowed"), false)
    }
  },
})

/**
 * @route POST /api/national-id/verify
 * @desc Verify a national ID from a PDF file
 * @access Private
 */
router.post("/verify", upload.single("file"), async (req, res) => {
  try {
    // Check if file and userId are provided
    if (!req.file || !req.body.userId) {
      return res.status(400).json({ message: "Missing file or user ID" })
    }

    // Create a File-like object from the multer file
    const file = {
      name: req.file.originalname,
      size: req.file.size,
      arrayBuffer: async () => req.file.buffer,
    }

    // Process and verify the national ID
    const result = await NationalIdController.verifyFromPdf(file, req.body.userId)

    // Return the result
    return res.status(200).json(result)
  } catch (error) {
    console.error("Error in national ID verification API:", error)
    return res.status(500).json({ message: "Failed to verify national ID" })
  }
})

/**
 * @route GET /api/national-id/user/:userId
 * @desc Get all national IDs linked to a user
 * @access Private
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId

    if (!userId) {
      return res.status(400).json({ message: "Missing user ID" })
    }

    const nationalIds = await NationalIdController.getUserNationalIds(userId)
    return res.status(200).json({ nationalIds })
  } catch (error) {
    console.error("Error retrieving national IDs:", error)
    return res.status(500).json({ message: "Failed to retrieve national IDs" })
  }
})

/**
 * @route DELETE /api/national-id/:id
 * @desc Remove a national ID link
 * @access Private
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id)
    const userId = req.query.userId || req.body.userId

    if (!userId) {
      return res.status(400).json({ message: "Missing user ID" })
    }

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" })
    }

    const result = await NationalIdController.removeNationalId(id, userId)
    return res.status(200).json(result)
  } catch (error) {
    console.error("Error removing national ID:", error)
    return res
      .status(error.message.includes("does not belong") ? 403 : 500)
      .json({ message: error.message || "Failed to remove national ID" })
  }
})

export default router;
