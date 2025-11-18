import mongoose from "mongoose";

const patientProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  age: Number,
  conditions: [String],
  medications: [String]
}, { timestamps: true });

export default mongoose.model("PatientProfile", patientProfileSchema);
