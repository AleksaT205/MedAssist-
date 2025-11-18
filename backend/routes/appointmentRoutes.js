import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  sendEmergency,
  getSlots,
  getPatientTherapyCalendar
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/", protect, authorize("patient"), createAppointment);
router.get("/", protect, authorize("patient"), getMyAppointments);

router.get("/doctor", protect, authorize("doctor"), getDoctorAppointments);

router.put("/:id/status", protect, updateAppointmentStatus);
router.post("/:id/emergency", protect, authorize("patient"), sendEmergency);

router.get("/slots", protect, getSlots);

router.get("/calendar", protect, authorize("patient"), getPatientTherapyCalendar);

export default router;
