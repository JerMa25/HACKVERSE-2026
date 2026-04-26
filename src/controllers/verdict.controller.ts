import { Request, Response } from "express";
import { pool } from "../config/db";

/**
 * GET /api/verdicts
 * Lister les verdicts (optionnel: filtrer par claim_id, is_published)
 */
export const getAllVerdicts = async (req: Request, res: Response) => {
  try {
    const { claim_id, is_published, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT v.*, m.name AS moderator_name, c.text AS claim_text
      FROM verdicts v
      LEFT JOIN moderators m ON m.id = v.moderator_id
      LEFT JOIN claims c ON c.id = v.claim_id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (claim_id) {
      params.push(claim_id);
      conditions.push(`v.claim_id = $${params.length}`);
    }

    if (is_published !== undefined) {
      params.push(is_published === "true");
      conditions.push(`v.is_published = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += ` ORDER BY v.published_at DESC NULLS LAST LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
      message: "Erreur lors de la récupération des verdicts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/verdicts/:id
 * Récupérer un verdict par son ID
 */
export const getVerdictById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT v.*, m.name AS moderator_name, c.text AS claim_text
       FROM verdicts v
       LEFT JOIN moderators m ON m.id = v.moderator_id
       LEFT JOIN claims c ON c.id = v.claim_id
       WHERE v.id = $1`,
      [id]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Verdict introuvable",
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
 * POST /api/verdicts
 * Créer un nouveau verdict (moderateur requis)
 */
export const createVerdict = async (req: Request, res: Response) => {
  try {
    const {
      claim_id,
      status,
      confidence_score,
      evidences_for,
      evidences_against,
      moderator_id,
      is_published,
      summary,
    } = req.body;

    if (!claim_id || !status || confidence_score === undefined || !moderator_id || !summary) {
      return res.status(400).json({
        success: false,
        message:
          "Champs requis : claim_id, status, confidence_score, moderator_id, summary",
      });
    }

    const validStatuses = ["True", "False", "ProbablyTrue", "Contested", "Unverifiable"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Valeurs acceptées : ${validStatuses.join(", ")}`,
      });
    }

    if (
      typeof confidence_score !== "number" ||
      confidence_score < 0 ||
      confidence_score > 1
    ) {
      return res.status(400).json({
        success: false,
        message: "confidence_score doit être un nombre entre 0 et 1",
      });
    }

    const published = is_published === true || is_published === "true";
    const publishedAt = published ? new Date() : null;

    const result = await pool.query(
      `INSERT INTO verdicts
         (claim_id, status, confidence_score, evidences_for, evidences_against,
          moderator_id, is_published, published_at, summary)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        claim_id,
        status,
        confidence_score,
        evidences_for || [],
        evidences_against || [],
        moderator_id,
        published,
        publishedAt,
        summary,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Verdict créé avec succès",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création du verdict",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
