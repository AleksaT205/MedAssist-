import Appointment from "../models/Appointment.js";
import DoctorProfile from "../models/DoctorProfile.js";
import Therapy from "../models/Therapy.js";

/* ============================================
   Helper funkcije za radno vreme i slotove
============================================ */
const isWithinWorkingHours = (date, workingHours) => {
  const [sh, sm] = workingHours.start.split(":").map(Number);
  const [eh, em] = workingHours.end.split(":").map(Number);

  const d = new Date(date);
  const mins = d.getHours()*60 + d.getMinutes();
  return mins >= (sh*60+sm) && mins <= (eh*60+em);
};

const isOnSlot = (date, slotMinutes) => {
  return date.getMinutes() % slotMinutes === 0;
};

/* ============================================
   1. Pacijent pravi termin
============================================ */
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date: dateStr, patientMessage } = req.body;

    const date = new Date(dateStr);
    const profile = await DoctorProfile.findOne({ user: doctorId });

    if (!profile) return res.status(400).json({ message: "Doktor nema profil" });

    if (!isWithinWorkingHours(date, profile.workingHours))
      return res.status(400).json({ message: "Termin nije u radnom vremenu" });

    if (!isOnSlot(date, profile.workingHours.slotMinutes))
      return res.status(400).json({ message: "Termin mora biti u slotu" });

    const conflict = await Appointment.findOne({
      $or: [
        { doctor: doctorId, date, status: { $in: ["pending","confirmed"] }},
        { patient: req.user._id, date, status: { $in: ["pending","confirmed"] }},
      ]
    });

    if (conflict) return res.status(400).json({ message: "Termin zauzet" });

    const appt = await Appointment.create({
      doctor: doctorId,
      patient: req.user._id,
      date,
      patientMessage
    });

    res.status(201).json(appt);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================
   2. Pacijent vidi svoje termine
============================================ */
export const getMyAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find({ patient: req.user._id })
      .populate("doctor", "name email");
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================
   3. Doktor vidi svoje termine
============================================ */
export const getDoctorAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find({ doctor: req.user._id })
      .populate("patient", "name email");
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================
   4. Ažuriranje termina
============================================ */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, proposedDate, doctorMessage } = req.body;

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Termin ne postoji" });

    if (status) appt.status = status;
    if (proposedDate) appt.proposedDate = new Date(proposedDate);
    if (doctorMessage !== undefined) appt.doctorMessage = doctorMessage;

    await appt.save();
    res.json(appt);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================
   5. Hitna situacija
============================================ */
export const sendEmergency = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Termin ne postoji" });

    appt.emergency = true;
    await appt.save();

    res.json({ message: "Hitan alarm poslat", appointment: appt });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================
   6. Slobodni slotovi za doktora
============================================ */
export const getSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    const profile = await DoctorProfile.findOne({ user: doctorId });
    if (!profile) return res.status(404).json({ message: "Doktor nema profil" });

    const slotMins = profile.workingHours.slotMinutes;
    const [sh, sm] = profile.workingHours.start.split(":").map(Number);
    const [eh, em] = profile.workingHours.end.split(":").map(Number);

    const start = new Date(`${date}T${sh}:${sm}`);
    const end = new Date(`${date}T${eh}:${em}`);

    const slots = [];
    for (let d = new Date(start); d <= end; d.setMinutes(d.getMinutes() + slotMins)) {
      slots.push(d.toTimeString().slice(0,5));
    }

    const existing = await Appointment.find({
      doctor: doctorId,
      date: { $gte: new Date(`${date}T00:00`), $lte: new Date(`${date}T23:59`) },
      status: { $in: ["pending","confirmed"] }
    });

    const booked = existing.map(a => new Date(a.date).toTimeString().slice(0,5));
    const available = slots.filter(s => !booked.includes(s));

    res.json(available);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================
   7. Kalendar terapija pacijenta
============================================ */

export const getPatientTherapyCalendar = async (req, res) => {
  try {
    const therapies = await Therapy.find({ patient: req.user._id });

    // Flatten u događaje po leku
    const events = [];

    therapies.forEach(t => {
      t.medications.forEach(m => {
        if (!m.startDate || !m.endDate || !m.schedule || m.schedule.length === 0) return;

        events.push({
          medicationName: m.name,
          dose: m.dose,
          schedule: m.schedule,
          startDate: m.startDate,
          endDate: m.endDate
        });
      });
    });

    res.json(events);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
