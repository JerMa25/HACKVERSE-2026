import { Request, Response } from "express";
import { pool } from "../config/db";

/**
 * GET /api/evidence
 * Lister les évidences (optionnel: filtrer par rumor_id)
 */
export const getAllEvidence = async (req: Request, res: Response) => {
  try {
    const { rumor_id, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT e.*, u.name AS uploader_name
      FROM evidence e
      LEFT JOIN users u ON u.id = e.uploaded_by
    `;
    const params: any[] = [];

    if (rumor_id) {
      params.push(rumor_id);
      query += ` WHERE e.rumor_id = $${params.length}`;
    }

    query += ` ORDER BY e.t_upload DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      data: result.rows,
      total: result.rowCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des évidences",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/evidence/:id
 * Récupérer une évidence par son ID
 */
export const getEvidenceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT e.*, u.name AS uploader_name
       FROM evidence e
       LEFT JOIN users u ON u.id = e.uploaded_by
       WHERE e.id = $1`,
      [id]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Évidence introuvable",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * POST /api/evidence
 * Soumettre une nouvelle évidence
 */
export const createEvidence = async (req: Request, res: Response) => {
  try {
    const {
      type,
      file_url,
      t_event,
      t_observation,
      hash_file,
      metadata,
      rumor_id,
      uploaded_by,
    } = req.body;

    if (!type || !file_url || !t_event || !t_observation || !hash_file || !rumor_id || !uploaded_by) {
      return res.status(400).json({
        success: false,
        message:
          "Champs requis : type, file_url, t_event, t_observation, hash_file, rumor_id, uploaded_by",
      });
    }

    const validTypes = ["video", "audio", "text", "image"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Type invalide. Valeurs acceptées : ${validTypes.join(", ")}`,
      });
    }

    const result = await pool.query(
      `INSERT INTO evidence
         (type, file_url, t_event, t_observation, hash_file, metadata, rumor_id, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        type,
        file_url,
        t_event,
        t_observation,
        hash_file,
        metadata ? JSON.stringify(metadata) : "{}",
        rumor_id,
        uploaded_by,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Évidence soumise avec succès",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'évidence",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
