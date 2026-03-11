//backend\controllers\questionController.js
const Question = require("../models/questionModel");

// ✅ Add new question
exports.addQuestion = async (req, res) => {
  try {
    const { question, category } = req.body;

    if (!question || !category) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newQuestion = new Question({ question, category });
    await newQuestion.save();

    res.status(201).json({
      success: true,
      message: "Question added successfully",
      data: newQuestion,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get all questions (with optional filter)
exports.getQuestions = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const questions = await Question.find(filter);
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update a question
exports.updateQuestion = async (req, res) => {
  try {
    const { question, category } = req.body;

    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      { question, category },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
