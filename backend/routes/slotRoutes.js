import express from "express";
import { protect } from "../middleware/auth.js";
import { generateDailySlots } from "../utils/generateSlots.js";

const router = express.Router();

router.get("/", protect, (req, res) => {
  const slots = generateDailySlots("08:00", "20:00", 30);
  res.json(slots);
});

export default router;
