const express = require("express");
const companyController = require("../controllers/company.controller.js");
const { protect, isRecruiter } = require("../middleware/authMiddleware.js");
const { singleUpload } = require("../middleware/multer.js");

const router = express.Router();

router.post("/register", protect, isRecruiter, companyController.registerCompany);
router.get("/get", protect, isRecruiter, companyController.getCompany);
router.get("/get/:id", protect, companyController.getCompanyById);
router.put("/update/:id", protect, isRecruiter, singleUpload, companyController.updateCompany);

module.exports = router;
