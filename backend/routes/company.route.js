const express = require("express");
const { protect, isAdminOrRecruiter, isSuperAdmin } = require("../middleware/authMiddleware");
const { 
    registerCompany, 
    getCompany, 
    getCompanyById, 
    updateCompany, 
    getPublicCompanies 
} = require("../controllers/company.controller.js");
const { singleUpload } = require("../middleware/multer.js");

const router = express.Router();

// 1. Static Public Route (Candidate/Visitor access) - MUST BE FIRST
router.route("/public").get(getPublicCompanies); 

// 2. ADMIN ONLY - Management (As per your requirement)
router.route("/register").post(protect, isSuperAdmin, registerCompany);
router.route("/get").get(protect, isAdminOrRecruiter, getCompany);

// 3. ID-based / Update (Recruiters can update their own via isAdminOrRecruiter)
router.route("/get/:id").get(protect, getCompanyById);
router.route("/update/:id").put(protect, isAdminOrRecruiter, singleUpload, updateCompany);

module.exports = router;