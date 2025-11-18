import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  diagnosis: String,
  notes: String,
  therapy: {
    medications: [
      {
        name: String,
        dose: String,
        schedule: [String],
        startDate: Date,
        endDate: Date,
      }
    ]
  }
});

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  entries: [entrySchema]
}, { timestamps: true });

export default mongoose.model("MedicalRecord", medicalRecordSchema);
