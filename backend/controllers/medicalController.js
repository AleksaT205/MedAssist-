import MedicalRecord from "../models/MedicalRecord.js";
import Therapy from "../models/Therapy.js";
import Appointment from "../models/Appointment.js";

/* ============================================
   Pacijenti za doktora (možeš da ostaviš kako si već imao)
============================================ */
export const getPatientsForDoctor = async (req, res) => {
  try {
    const appts = await Appointment.find({ doctor: req.user._id }).populate("patient", "name email");
    const uniquePatientsMap = new Map();

    appts.forEach(a => {
      if (a.patient?._id && !uniquePatientsMap.has(a.patient._id.toString())) {
        uniquePatientsMap.set(a.patient._id.toString(), a.patient);
      }
    });

    res.json(Array.from(uniquePatientsMap.values()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================
   Kartoni za doktora
============================================ */
export const getRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ doctor: req.user._id })
      .populate("patient", "name email");
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================
   Doktor ručno kreira karton (može ostati)
============================================ */
export const createRecord = async (req, res) => {
  try {
    const { patientId, diagnosis, notes } = req.body;

    const record = await MedicalRecord.create({
      doctor: req.user._id,
      patient: patientId,
      diagnosis,
      notes
    });

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================
   🔥 Doktor kreira TERAPIJU IZ TERMINA (više lekova)
============================================ */
export const createTherapyFromAppointment = async (req, res) => {
  try {
    const { appointmentId, medications, notes } = req.body;

    const appt = await Appointment.findById(appointmentId);
    if (!appt) return res.status(404).json({ message: "Termin ne postoji" });

    // da li ovaj doktor sme da radi sa ovim terminom
    if (appt.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Nemaš pristup ovom terminu" });
    }

    const patientId = appt.patient;

    if (!Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({ message: "Mora postojati bar jedan lek u terapiji" });
    }

    // Normalizacija lekova
    const normalizedMeds = medications
      .filter(m => m.name)  // bar ime
      .map(m => ({
        name: m.name,
        dose: m.dose || "",
        schedule: Array.isArray(m.schedule) ? m.schedule : [],
        startDate: m.startDate ? new Date(m.startDate) : undefined,
        endDate: m.endDate ? new Date(m.endDate) : undefined
      }));

    if (normalizedMeds.length === 0) {
      return res.status(400).json({ message: "Nevalidni podaci o lekovima" });
    }

    const therapy = await Therapy.create({
      doctor: req.user._id,
      patient: patientId,
      medications: normalizedMeds,
      notes: notes || ""
    });

    const medNames = normalizedMeds.map(m => m.name).join(", ");

    // upis u karton pacijenta
    // Pronadji karton pacijenta
    let record = await MedicalRecord.findOne({ patient: patientId });

    // Ako ne postoji, kreiraj
    if (!record) {
      record = await MedicalRecord.create({
        patient: patientId,
        doctor: req.user._id,
        entries: []
      });
    }

    // Dodaj novu stavku u karton
    const firstMed = normalizedMeds[0];

    record.entries.push({
      date: new Date(),
      diagnosis: `Propisana terapija`,
      notes: `Lek: ${firstMed.name}\nDoza: ${firstMed.dose || "-"}\nRaspored: ${firstMed.schedule.join(", ")}`,
      therapy: {
        medications: normalizedMeds
      }
    });



    await record.save();


    res.status(201).json(therapy);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================
   Pacijent vidi svoje terapije
============================================ */
export const getPatientTherapies = async (req, res) => {
  try {
    const therapies = await Therapy.find({ patient: req.user._id })
      .populate("doctor", "name email");
    res.json(therapies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================
   Pacijent vidi svoje kartone
============================================ */
export const getPatientRecords = async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ patient: req.user.id })
      .populate("doctor", "name email");

    res.json(record || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

