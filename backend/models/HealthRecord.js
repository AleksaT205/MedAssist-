import mongoose from "mongoose";

const healthRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  symptoms: String,
  diagnosis: String,
  tests: [String],
  therapy: [String],
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("HealthRecord", healthRecordSchema);
