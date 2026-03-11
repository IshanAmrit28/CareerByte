// backend/controllers/adminController.js
const User = require("../models/user");
const Question = require("../models/questionModel");

// Get all candidates and recruiters
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      userType: { $in: ["candidate", "recruiter"] },
    }).select("-password"); // Exclude password from response
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new question
exports.createQuestion = async (req, res) => {
  const { question, category } = req.body;

  if (!question || !category) {
    return res.status(400).json({ message: "Question and category are required" });
  }

  try {
    const newQuestion = await Question.create({
      question,
      category,
    });
    res.status(201).json({ message: "Question created successfully", question: newQuestion });
  } catch (err) {
    console.error("Error creating question:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedQuestion = await Question.findByIdAndDelete(id);
    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ message: "Question deleted successfully", id });
  } catch (err) {
    console.error("Error deleting question:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a question's category
exports.categorizeQuestion = async (req, res) => {
  const { id } = req.params;
  const { category } = req.body;

  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { category },
      { new: true, runValidators: true }
    );
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({ message: "Question category updated", question: updatedQuestion });
  } catch (err) {
    console.error("Error updating question category:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
