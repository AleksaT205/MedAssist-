import DoctorProfile from "../models/DoctorProfile.js";

export const createProfile = async (req, res) => {
  try {
    const { specialization, experience, bio, availableSlots, workingHours } = req.body;
    if (!specialization) return res.status(400).json({ message: "Specijalizacija obavezna" });

    const existing = await DoctorProfile.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ message: "Profil već postoji" });

    const profile = await DoctorProfile.create({
      user: req.user._id,
      specialization,
      experience,
      bio,
      availableSlots: availableSlots || [],
      workingHours: workingHours || undefined
    });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOneAndUpdate({ user: req.user._id }, req.body, { new: true, upsert: false });
    if (!profile) return res.status(404).json({ message: "Profil ne postoji" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await DoctorProfile.find().populate("user", "name email").sort({ specialization: 1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doc = await DoctorProfile.findById(req.params.id).populate("user", "name email");
    if (!doc) return res.status(404).json({ message: "Doktor ne postoji" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

