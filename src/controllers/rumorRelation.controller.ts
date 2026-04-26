import { Request, Response } from "express";
import { pool } from "../config/db";

/**
 * POST /api/rumor-relations
 */
export const createRumorRelation = async (req: Request, res: Response) => {
  try {
    const { rumor_id, parent_rumor_id, relation_type } = req.body;

    if (!rumor_id || !parent_rumor_id) {
      return res.status(400).json({
        success: false,
        message: "rumor_id and parent_rumor_id are required"
      });
    }

    if (rumor_id === parent_rumor_id) {
      return res.status(400).json({
        success: false,
        message: "A rumor cannot reference itself"
      });
    }

    // check rumors exist
    const check = await pool.query(
      "SELECT id FROM rumors WHERE id IN ($1, $2)",
      [rumor_id, parent_rumor_id]
    );

    if (check.rowCount !== 2) {
      return res.status(404).json({
        success: false,
        message: "One or both rumors not found"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO rumor_relations (rumor_id, parent_rumor_id, relation_type)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [rumor_id, parent_rumor_id, relation_type || "BASED_ON"]
    );

    return res.status(201).json({
      success: true,
      message: "Relation created successfully",
      data: result.rows[0]
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error creating relation",
      error: error.message
    });
  }
};


export const getRelationsByRumorId = async (req: Request, res: Response) => {
  try {
    const { rumor_id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        rr.id,
        rr.rumor_id,
        rr.parent_rumor_id,
        rr.relation_type,
        rr.created_at,
        r.text AS parent_text
      FROM rumor_relations rr
      JOIN rumors r ON r.id = rr.parent_rumor_id
      WHERE rr.rumor_id = $1
      ORDER BY rr.created_at DESC
      `,
      [rumor_id]
    );

    return res.status(200).json({
      success: true,
      message: "Relations retrieved successfully",
      count: result.rowCount,
      data: result.rows
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving relations",
      error: error.message
    });
  }
};