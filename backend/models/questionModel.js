//backend\models\questionModel.js
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["DBMS", "OS", "CN", "OOP", "RESUME", "ALGORITHM"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
