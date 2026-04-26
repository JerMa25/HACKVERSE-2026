import { Router } from "express";
import {
  getAllVerdicts,
  getVerdictById,
  createVerdict,
} from "../controllers/verdict.controller";

const router = Router();

/**
 * @swagger
 * /api/verdicts:
 *   get:
 *     summary: Lister les verdicts
 *     tags: [Verdicts]
 *     parameters:
 *       - in: query
 *         name: claim_id
 *         schema: { type: string }
 *         description: Filtrer par claim
 *       - in: query
 *         name: is_published
 *         schema: { type: boolean }
 *         description: Filtrer par statut de publication
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Liste des verdicts
 */
router.get("/", getAllVerdicts);

/**
 * @swagger
 * /api/verdicts/{id}:
 *   get:
 *     summary: Récupérer un verdict par ID
 *     tags: [Verdicts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Verdict trouvé
 *       404:
 *         description: Introuvable
 */
router.get("/:id", getVerdictById);

/**
 * @swagger
 * /api/verdicts:
 *   post:
 *     summary: Créer un verdict
 *     tags: [Verdicts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [claim_id, status, confidence_score, moderator_id, summary]
 *             properties:
 *               claim_id:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [True, False, ProbablyTrue, Contested, Unverifiable]
 *               confidence_score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0.85
 *               evidences_for:
 *                 type: array
 *                 items: { type: string }
 *               evidences_against:
 *                 type: array
 *                 items: { type: string }
 *               moderator_id:
 *                 type: string
 *               is_published:
 *                 type: boolean
 *               summary:
 *                 type: string
 *                 example: "Cette rumeur est confirmée par 3 sources indépendantes."
 *     responses:
 *       201:
 *         description: Verdict créé
 *       400:
 *         description: Données invalides
 */
router.post("/", createVerdict);

export default router;
