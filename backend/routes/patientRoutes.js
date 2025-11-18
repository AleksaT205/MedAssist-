import express from "express";
import { protect } from "../middleware/auth.js";
import { createProfile, getMyProfile } from "../controllers/patientController.js";

const router = express.Router();
router.post("/profile", protect, createProfile);
router.get("/profile", protect, getMyProfile);

export default router;
