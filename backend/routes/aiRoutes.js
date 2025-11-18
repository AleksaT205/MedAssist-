import express from "express";
import { analyzeSymptoms } from "../controllers/AIController.js";

const router = express.Router();

router.post("/analyze", analyzeSymptoms); // bez authMiddleware

export default router;
