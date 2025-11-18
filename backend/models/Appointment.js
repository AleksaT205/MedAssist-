import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },

  patientMessage: String,
  doctorMessage: String,

  proposedDate: Date,
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled", "reschedule_pending", "rejected"],
    default: "pending"
  },

  emergency: { type: Boolean, default: false },

}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);
