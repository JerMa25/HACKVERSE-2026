import { Request, Response } from "express";
import * as bcrypt from "bcryptjs";
import { pool } from "../config/db";
import { Moderator } from "../Model/types";

/**
 * GET /api/moderators
 * Lister les modérateurs
 */
export const getAllModerators = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, level, 'moderator' AS role FROM moderators"
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      total: result.rowCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des modérateurs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/moderators/:id
 * Récupérer un modérateur par son ID
 */
export const getModeratorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id, name, email, level, 'moderator' AS role FROM moderators WHERE id = $1",
      [id]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Modérateur introuvable",
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
 * POST /api/moderators
 * Créer un nouveau modérateur
 */
export const createModerator = async (req: Request, res: Response) => {
  try {
    const { name, email, password, level } = req.body;

    if (!name || !email || !password || !level) {
      return res.status(400).json({
        success: false,
        message: "Champs requis : name, email, password, level",
      });
    }

    const validLevels = ["junior", "senior", "admin"];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: `Niveau invalide. Valeurs acceptées : ${validLevels.join(", ")}`,
      });
    }

    // Vérifier si l'email existe déjà
    const existing = await pool.query(
      "SELECT id FROM moderators WHERE email = $1",
      [email]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Un modérateur avec cet email existe déjà",
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO moderators (name, email, password_hash, level)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, level, 'moderator' AS role`,
      [name, email, password_hash, level]
    );

    return res.status(201).json({
      success: true,
      message: "Modérateur créé avec succès",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création du modérateur",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
