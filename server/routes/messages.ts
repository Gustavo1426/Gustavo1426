import { Router } from "express";
import { generateMessage } from "../controllers/messagesController.js";

const router = Router();

router.post("/generate-message", generateMessage);

export default router;
