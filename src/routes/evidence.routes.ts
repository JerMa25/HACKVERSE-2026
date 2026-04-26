import { Router } from "express";
import {
  getAllEvidence,
  getEvidenceById,
  createEvidence,
} from "../controllers/evidence.controller";

const router = Router();

/**
 * @swagger
 * /api/evidence:
 *   get:
 *     summary: Lister les évidences
 *     tags: [Evidence]
 *     parameters:
 *       - in: query
 *         name: rumor_id
 *         schema: { type: string }
 *         description: Filtrer par rumeur
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200:
 *         description: Liste des évidences
 */
router.get("/", getAllEvidence);

/**
 * @swagger
 * /api/evidence/{id}:
 *   get:
 *     summary: Récupérer une évidence par ID
 *     tags: [Evidence]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Évidence trouvée
 *       404:
 *         description: Introuvable
 */
router.get("/:id", getEvidenceById);

/**
 * @swagger
 * /api/evidence:
 *   post:
 *     summary: Soumettre une nouvelle évidence
 *     tags: [Evidence]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, file_url, t_event, t_observation, hash_file, rumor_id, uploaded_by]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [video, audio, text, image]
 *               file_url:
 *                 type: string
 *                 example: "https://cdn.example.com/video.mp4"
 *               t_event:
 *                 type: string
 *                 format: date-time
 *               t_observation:
 *                 type: string
 *                 format: date-time
 *               hash_file:
 *                 type: string
 *                 example: "sha256:a3f9..."
 *               metadata:
 *                 type: object
 *               rumor_id:
 *                 type: string
 *               uploaded_by:
 *                 type: string
 *     responses:
 *       201:
 *         description: Évidence créée
 *       400:
 *         description: Données invalides
 */
router.post("/", createEvidence);

export default router;
