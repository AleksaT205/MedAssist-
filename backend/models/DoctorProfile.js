import mongoose from "mongoose";

const doctorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  specialization: { type: String, required: true },
  experience: String,
  bio: String,

  workingHours: {
    start: { type: String, default: "08:00" },
    end: { type: String, default: "20:00" },
    slotMinutes: { type: Number, default: 30 },
  },

  availableSlots: [String]
}, { timestamps: true });

export default mongoose.model("DoctorProfile", doctorProfileSchema);
