import PatientProfile from "../models/PatientProfile.js";
import MedicalRecord from "../models/MedicalRecord.js";

export const createProfile = async (req, res) => {
  try {
    const { age, conditions, medications } = req.body;
    const existing = await PatientProfile.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ message: "Profil već postoji" });

    const profile = await PatientProfile.create({
      user: req.user._id,
      age,
      conditions,
      medications,
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyProfile = async (req, res) => {
  const profile = await PatientProfile.findOne({ user: req.user._id }).populate("user", "name email");
  res.json(profile);
};
