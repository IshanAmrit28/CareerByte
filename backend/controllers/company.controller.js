const Company = require("../models/company.js");
const getDataUri = require("../utils/datauri.js");
const cloudinary = require("../utils/cloudinary.js");

const getRole = (user) => (user?.userType || "").toLowerCase().trim();

exports.getPublicCompanies = async (req, res) => {
    try {
        const companies = await Company.find({ status: 'active' }).select("name _id logo description");
        return res.status(200).json({ companies, success: true });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

exports.registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;
        if (!companyName) return res.status(400).json({ message: "Company name is required.", success: false });

        let company = await Company.findOne({ name: companyName });
        if (company) return res.status(400).json({ message: "Company already exists.", success: false });

        company = await Company.create({ name: companyName, userId: req.id });
        return res.status(201).json({ message: "Company registered successfully.", company, success: true });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

exports.getCompany = async (req, res) => {
    try {
        const role = getRole(req.user);
        let companies;

        if (role === 'admin') {
            companies = await Company.find({});
        } else {
            // Recruiter sees company assigned to profile OR company they created
            companies = await Company.find({
                $or: [{ _id: req.user.company }, { userId: req.id }]
            });
        }

        if (!companies || companies.length === 0) {
            return res.status(404).json({ message: "Companies not found.", success: false });
        }
        return res.status(200).json({ companies, success: true });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

exports.getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) return res.status(404).json({ message: "Company not found.", success: false });
        return res.status(200).json({ company, success: true });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const role = getRole(req.user);
        const file = req.file;
        
        // Multi-tenant isolation: Recruiters only update their assigned company
        const targetId = role === 'admin' ? req.params.id : req.user.company;

        if (!targetId) return res.status(403).json({ message: "No company associated with user.", success: false });

        let logo;
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            logo = cloudResponse.secure_url;
        }
    
        const updateData = { name, description, website, location };
        if (logo) updateData.logo = logo;

        const company = await Company.findByIdAndUpdate(targetId, updateData, { new: true });
        if (!company) return res.status(404).json({ message: "Company not found.", success: false });

        return res.status(200).json({ message: "Company information updated.", success: true });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};