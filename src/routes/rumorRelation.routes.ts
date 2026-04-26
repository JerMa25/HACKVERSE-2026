import { Router } from "express";
import {
  createRumorRelation,
  getRelationsByRumorId,
 
} from "../controllers/rumorRelation.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Rumor Relations
 *   description: Gestion des relations entre rumeurs
 */

/**
 * @swagger
 * /api/rumor-relations:
 *   post:
 *     tags: [Rumor Relations]
 *     summary: Lier une rumeur à une ou plusieurs rumeurs sources
 *     description: Crée une relation BASED_ON entre une rumeur et ses rumeurs parentes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rumor_id
 *               - parent_rumor_id
 *             properties:
 *               rumor_id:
 *                 type: string
 *                 example: rumor_1
 *               parent_rumor_id:
 *                 type: string
 *                 example: rumor_2
 *               relation_type:
 *                 type: string
 *                 example: BASED_ON
 *     responses:
 *       201:
 *         description: Relation créée avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post("/", createRumorRelation);

/**
 * @swagger
 * /api/rumor-relations/{rumor_id}:
 *   get:
 *     tags: [Rumor Relations]
 *     summary: Récupérer toutes les relations d'une rumeur
 *     description: Retourne toutes les rumeurs sources liées à une rumeur donnée
 *     parameters:
 *       - in: path
 *         name: rumor_id
 *         required: true
 *         schema:
 *           type: string
 *         example: rumor_1
 *     responses:
 *       200:
 *         description: Relations récupérées avec succès
 *       404:
 *         description: Rumeur introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get("/:rumor_id", getRelationsByRumorId);


export default router;