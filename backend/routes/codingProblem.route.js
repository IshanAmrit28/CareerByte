const express = require("express");
const router = express.Router();
const { protect, isAdminOrRecruiter } = require("../middleware/authMiddleware");
const { 
    createProblem, 
    getAllProblems, 
    getProblemById, 
    updateProblem, 
    deleteProblem 
} = require("../controllers/codingProblem.controller");

router.post("/", protect, isAdminOrRecruiter, createProblem);
router.get("/", protect, getAllProblems);
router.get("/:id", protect, getProblemById);
router.put("/:id", protect, isAdminOrRecruiter, updateProblem);
router.delete("/:id", protect, isAdminOrRecruiter, deleteProblem);

module.exports = router;
