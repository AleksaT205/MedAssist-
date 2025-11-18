import Therapy from "../models/Therapy.js";

export const createTherapy = async (req, res) => {
  try {
    const therapy = await Therapy.create({ ...req.body, doctor: req.user.id });
    res.json(therapy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPatientTherapies = async (req, res) => {
  try {
    const therapies = await Therapy.find({ patient: req.user.id }).populate("doctor", "name email");
    res.json(therapies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
