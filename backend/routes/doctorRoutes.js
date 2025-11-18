import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { createProfile, getAllDoctors, updateProfile, getDoctorById } from "../controllers/doctorController.js";

const router = express.Router();

router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);
router.post("/profile", protect, authorize("doctor"), createProfile);
router.put("/profile", protect, authorize("doctor"), updateProfile);

export default router;
