import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  fromPatient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  toDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: String,
  handled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Alert", alertSchema);
