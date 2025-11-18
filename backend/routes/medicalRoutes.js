import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getPatientsForDoctor,
  getRecords,
  createRecord,
  createTherapyFromAppointment,
  getPatientTherapies,
  getPatientRecords
} from "../controllers/medicalController.js";

const router = express.Router();

router.get("/patients", protect, authorize("doctor"), getPatientsForDoctor);
router.get("/records", protect, authorize("doctor"), getRecords);
router.post("/record", protect, authorize("doctor"), createRecord);

router.post("/therapy-from-appointment", protect, authorize("doctor"), createTherapyFromAppointment);

router.get("/my-records", protect, authorize("patient"), getPatientRecords);
router.get("/my-therapies", protect, authorize("patient"), getPatientTherapies);

export default router;


