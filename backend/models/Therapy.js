import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },      // npr. "Ibuprofen 400mg"
  dose: { type: String },                      // npr. "1 tbl"
  schedule: [String],                          // ["08:00","14:00","20:00"]
  startDate: Date,                             // od kada
  endDate: Date                                // do kada
}, { _id: false });

const therapySchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // VIŠE LEKOVA
  medications: {
    type: [medicationSchema],
    default: []
  },

  // opšti komentar doktora (opciono)
  notes: { type: String }

}, { timestamps: true });

export default mongoose.model("Therapy", therapySchema);
