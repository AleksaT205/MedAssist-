import HealthRecord from "../models/HealthRecord.js";

export const createRecord = async (req, res) => {
  try {
    const record = await HealthRecord.create({ ...req.body, doctor: req.user.id });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPatientRecords = async (req, res) => {
  try {
    const records = await HealthRecord.find({ patient: req.user.id }).populate("doctor", "name email");
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
