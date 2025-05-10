import pool from '../config/db.js';

export class NationalId {
    /**
     * Check if a national ID is already linked to a user
     */
    static async isLinkedToUser(idNumber) {
      try {
        const result = await pool.query("SELECT user_id FROM national_ids WHERE id_number = $1", [idNumber])
  
        if (result.rows.length === 0) {
          return { isLinked: false, userId: null }
        }
  
        return { isLinked: true, userId: result.rows[0].user_id }
      } catch (error) {
        console.error("Database error checking if ID is linked:", error)
        throw new Error("Failed to check if ID is linked to a user")
      }
    }
  
    /**
     * Validate a national ID against the nationid table
     */
    static async validate(idNumber) {
      try {
        const result = await pool.query(
          `SELECT 
            id_number, 
            full_name, 
            date_of_birth, 
            gender, 
            is_valid, 
            is_active, 
            issued_at, 
            expires_at 
          FROM nationid 
          WHERE id_number = $1`,
          [idNumber],
        )
  
        if (result.rows.length === 0) {
          return null
        }
  
        return result.rows[0]
      } catch (error) {
        console.error("Database error validating ID:", error)
        throw new Error("Failed to validate national ID")
      }
    }
  
    /**
     * Link a national ID to a user
     */
    static async linkToUser(idNumber, userId) {
      try {
        await pool.query(
          `INSERT INTO national_ids 
            (id_number, user_id, verified_at, created_at, updated_at) 
          VALUES 
            ($1, $2, NOW(), NOW(), NOW())`,
          [idNumber, userId],
        )
      } catch (error) {
        console.error("Database error linking ID to user:", error)
        throw new Error("Failed to link national ID to user")
      }
    }
  
    /**
     * Update verification timestamp for an existing link
     */
    static async updateVerification(idNumber, userId) {
      try {
        await pool.query(
          `UPDATE national_ids 
          SET verified_at = NOW(), updated_at = NOW() 
          WHERE id_number = $1 AND user_id = $2`,
          [idNumber, userId],
        )
      } catch (error) {
        console.error("Database error updating verification:", error)
        throw new Error("Failed to update verification timestamp")
      }
    }
  
    /**
     * Get all national IDs linked to a user
     */
    static async getByUserId(userId) {
      try {
        const result = await pool.query(`SELECT * FROM national_ids WHERE user_id = $1 ORDER BY verified_at DESC`, [userId])
  
        return result.rows
      } catch (error) {
        console.error("Database error getting IDs by user:", error)
        throw new Error("Failed to get national IDs for user")
      }
    }
  
    /**
     * Delete a national ID link
     */
    static async delete(id) {
      try {
        await pool.query("DELETE FROM national_ids WHERE id = $1", [id])
      } catch (error) {
        console.error("Database error deleting ID link:", error)
        throw new Error("Failed to delete national ID link")
      }
    }
  }
  