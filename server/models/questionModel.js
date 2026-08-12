import mongoose from "mongoose";

const questionModel = new mongoose.Schema({
  subject: { type: String, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  text: { type: String, required: true },
  options: [
    { option: { type: String, required: true }, isCorrect: { type: Boolean, default: false } }
  ],
  correctOption: { type: Number, required: true }
}, { collection: "question" });

export default mongoose.model("Question", questionModel);