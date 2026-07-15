import { Router } from "express";
import { getIaCoach } from "../controllers/coachController.js";

const router = Router();

router.post("/ia-coach", getIaCoach);

export default router;
