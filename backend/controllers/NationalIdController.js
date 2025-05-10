import { extractTextFromPdf, extractAllPossibleData } from "../lib/pdf-extractor.js"
import { NationalId } from "../models/NationalId.js"

export class NationalIdController {
  /**
   * Process and verify a national ID from a PDF file
   */
  static async verifyFromPdf(file, userId) {
    try {
      // Extract text from PDF
      const fileBuffer = await file.arrayBuffer()
      const extractedText = await extractTextFromPdf(Buffer.from(fileBuffer))

      // Extract data from the text
      const extractedData = extractAllPossibleData(extractedText)

      // Get ID number from extracted data
      const idNumber = extractedData.idNumber

      // If no ID number found, return error
      if (!idNumber) {
        return {
          isVerified: false,
          isLinked: false,
          message: "Could not extract ID number from the document",
          extractedData,
        }
      }

      // Check if ID is already linked to a user
      const { isLinked, userId: linkedUserId } = await NationalId.isLinkedToUser(idNumber)

      // If ID is linked to another user
      if (isLinked && linkedUserId !== userId) {
        return {
          isVerified: false,
          isLinked: true,
          message: "This national ID is already linked to another account",
          extractedData,
        }
      }

      // Validate the ID against the nationid table
      const validationResult = await NationalId.validate(idNumber)

      // If ID is not valid
      if (!validationResult) {
        return {
          isVerified: false,
          isLinked: false,
          message: "Invalid national ID number",
          extractedData,
        }
      }

      // If ID is not active
      if (!validationResult.is_active) {
        return {
          isVerified: false,
          isLinked: false,
          message: "This national ID is no longer active",
          extractedData,
        }
      }

      // If ID is expired (if expiration date exists and is in the past)
      if (validationResult.expires_at && new Date(validationResult.expires_at) < new Date()) {
        return {
          isVerified: false,
          isLinked: false,
          message: "This national ID has expired",
          extractedData,
        }
      }

      // If ID is valid and not linked to another user, link it to the current user
      if (!isLinked) {
        await NationalId.linkToUser(idNumber, userId)
      } else {
        // Update verification timestamp if already linked to this user
        await NationalId.updateVerification(idNumber, userId)
      }

      // Merge extracted data with validation data for more complete information
      const enhancedData = {
        ...extractedData,
        fullName: validationResult.full_name || extractedData.fullName,
        dob: validationResult.date_of_birth || extractedData.dob,
        gender: validationResult.gender || extractedData.gender,
        issueDate: validationResult.issued_at
          ? new Date(validationResult.issued_at).toISOString().split("T")[0]
          : extractedData.issueDate,
      }

      // Return success response
      return {
        isVerified: true,
        isLinked: false,
        message: "National ID verified successfully",
        extractedData: enhancedData,
      }
    } catch (error) {
      console.error("Error in national ID verification:", error)
      throw new Error("Failed to verify national ID")
    }
  }

  /**
   * Validate file before processing
   */
  static validateFile(file) {
    // Check file type
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return { isValid: false, message: "Only PDF files are accepted" }
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return { isValid: false, message: "File size exceeds 5MB limit" }
    }

    return { isValid: true, message: "File is valid" }
  }

  /**
   * Get all national IDs linked to a user
   */
  static async getUserNationalIds(userId) {
    return await NationalId.getByUserId(userId)
  }

  /**
   * Remove a national ID link
   */
  static async removeNationalId(id, userId) {
    // First check if the ID belongs to the user
    const userIds = await NationalId.getByUserId(userId)
    const idBelongsToUser = userIds.some((record) => record.id === id)

    if (!idBelongsToUser) {
      throw new Error("National ID does not belong to this user")
    }

    await NationalId.delete(id)
    return { success: true, message: "National ID link removed successfully" }
  }
}
