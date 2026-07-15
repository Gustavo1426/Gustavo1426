import { Router } from "express";
import {
  generateMusculacaoWorkout,
  generatePeriodization,
  generateFunctionalWorkout
} from "../controllers/workoutsController.js";

const router = Router();

router.post("/generate-musculacao-workout", generateMusculacaoWorkout);
router.post("/generate-periodization", generatePeriodization);
router.post("/generate-functional-workout", generateFunctionalWorkout);

export default router;
