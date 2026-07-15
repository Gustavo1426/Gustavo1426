import { Router } from "express";
import { analyzeBody, generateLaudo } from "../controllers/analysisController.js";

const router = Router();

// API route for analyzing athlete photos (body composition, posture, biotype)
router.post("/analyze-body", analyzeBody);

// API route for generating Step 05 - Unified Report (Laudo Unificado)
router.post("/generate-laudo", generateLaudo);

export default router;
