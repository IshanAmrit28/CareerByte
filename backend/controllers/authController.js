//backend\controllers\authController.js
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 🔹 Helper: Generate JWT
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, userType: user.userType },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

// ==================== SIGNUP ====================
exports.signup = [
  // Validation
  check("userName", "Name is required").notEmpty(),
  check("email", "Please enter a valid email").isEmail(),
  check("password", "Password must be at least 6 characters").isLength({
    min: 6,
  }),
  check("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match");
    return true;
  }),
  check("userType", "Please select a user type").notEmpty(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
    }

    try {
      const { userName, email, password, userType, fullname, phoneNumber, company } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "Email already registered" });

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await User.create({
        userName,
        fullname: fullname || userName,
        email,
        phoneNumber,
        password: hashedPassword,
        userType,
        company: company || undefined,
        authProvider: 'local',
        hasPassword: true
      });

      const token = generateToken(user);

      res.status(201).json({
        message: "Signup successful",
        user: { id: user._id, userName, email, userType },
        token,
      });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ message: "Internal server error", error: err.message });
    }
  },
];

// ==================== LOGIN ====================
exports.login = async (req, res) => {
  const { email, password, role } = req.body; // role might be passed by jobboard

  if (!email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    // FIX: Populate 'report' because it is a virtual field, not a real column
    // The previous '.select("+report")' was incorrect for virtuals.
    const user = await User.findOne({ email })
      .select("+userName +email +userType +createdAt +updatedAt +fullname +phoneNumber +profile +role +password")
      .populate("report");

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    // Jobboard checks role
    if (role && role !== user.userType) {
        return res.status(400).json({ message: "Account doesn't exist with current role.", success: false });
    }

    const token = generateToken(user);

    // FIX: Send the complete user object (excluding password) in the response
    const userResponse = {
      id: user._id,
      _id: user._id,
      userName: user.userName,
      fullname: user.fullname || user.userName,
      email: user.email,
      userType: user.userType,
      role: user.userType,
      phoneNumber: user.phoneNumber,
      profile: user.profile,
      company: user.company,
      // Use user.get('report') to bypass IDE TypeScript strict checking for virtuals
      report: user.get('report'), 
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // return res.status(200).cookie(...)
    res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: true }).json({
      message: `Welcome back ${userResponse.fullname}`,
      user: userResponse, // Sending the full data structure
      token,
      success: true
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message, success: false });
  }
};

// ==================== LOGOUT ====================
exports.logout = (req, res) => {
  res.status(200).cookie("token", "", { maxAge: 0, sameSite: 'none', secure: true }).json({ message: "Logged out successfully", success: true });
};

// ==================== UPDATE PROFILE ====================
exports.updateProfile = async (req, res) => {
  try {
      const { fullname, email, phoneNumber, bio, skills, userName } = req.body;
      
      const files = req.files;
      const getDataUri = require("../utils/datauri.js");
      const cloudinary = require("../utils/cloudinary.js");

      const userId = req.id || req.user.id; // middleware authentication
      let user = await User.findById(userId);

      if (!user) {
          return res.status(400).json({
              message: "User not found.",
              success: false
          });
      }

      if(!user.profile) {
          user.profile = { skills: [], profilePhoto: "" };
      }

      // Handle Profile Photo Upload
      if (files && files.profilePhoto) {
          const profilePhotoFile = files.profilePhoto[0];
          const fileUri = getDataUri(profilePhotoFile);
          const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
              folder: "profile_photos",
              resource_type: "image"
          });
          user.profile.profilePhoto = cloudResponse.secure_url;
      }

      // Handle Resume Upload (Field name "resume")
      if (files && files.resume) {
          const resumeFile = files.resume[0];
          const fileUri = getDataUri(resumeFile);
          const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
              folder: "resumes",
              resource_type: "raw"
          });
          user.profile.resume = cloudResponse.secure_url;
          user.profile.resumeOriginalName = resumeFile.originalname;
      }

      // Handle Legacy File Upload (Field name "file")
      if (files && files.file) {
        const legacyFile = files.file[0];
        const fileUri = getDataUri(legacyFile);
        // Determine if it's an image or a document based on mimetype
        const isImage = legacyFile.mimetype.startsWith('image/');
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
            resource_type: isImage ? "image" : "raw"
        });
        if (isImage) {
            user.profile.profilePhoto = cloudResponse.secure_url;
        } else {
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = legacyFile.originalname;
        }
    }

      let skillsArray;
      if(skills){
          skillsArray = skills.split(",");
      }
      
      // updating data
      if(fullname) user.fullname = fullname;
      if(userName) user.userName = userName.trim();
      if(email) user.email = email;
      if(phoneNumber)  user.phoneNumber = phoneNumber;
      if(bio) user.profile.bio = bio;
      if(skills) user.profile.skills = skillsArray;
    
      await user.save();

      const userResponse = {
          _id: user._id,
          id: user._id,
          fullname: user.fullname,
          userName: user.userName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.userType,
          userType: user.userType,
          profile: user.profile
      };

      return res.status(200).json({
          message: "Profile updated successfully.",
          user: userResponse,
          success: true
      });
  } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ==================== REGISTER (Job board compatibility) ====================
exports.register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
         
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }
        const file = req.file;
        let cloudResponse;
        if(file) {
            const getDataUri = require("../utils/datauri.js");
            const cloudinary = require("../utils/cloudinary.js");
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            });
        }
        
        const bcrypt = require("bcryptjs");
        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            fullname,
            userName: fullname, // Map fullname to userName for main app compatibility
            email,
            phoneNumber,
            password: hashedPassword,
            userType: role,
            company: role === 'recruiter' ? req.body.company : undefined,
            profile:{
                profilePhoto: cloudResponse ? cloudResponse.secure_url : "",
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};
// ==================== GET COMPANY MEMBERS ====================
exports.getCompanyMembers = async (req, res) => {
    try {
        const companyId = req.user.company;
        if (!companyId) {
            return res.status(400).json({
                message: "No company associated with this account.",
                success: false
            });
        }

        const members = await User.find({ 
            company: companyId
        }).select("userName fullname email profile.profilePhoto updatedAt");

        return res.status(200).json({
            success: true,
            members
        });
    } catch (error) {
        console.error("fetch members error:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

// ==================== GOOGLE LOGIN ====================
exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "Google ID Token is required", success: false });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (user) {
      // User exists, update googleId if not present (merging local to google)
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = user.authProvider === 'local' ? 'local' : 'google'; // Keep as local if they already have a password
        await user.save();
      }
    } else {
      // Create new candidate user
      user = await User.create({
        userName: name,
        fullname: name,
        email,
        googleId,
        authProvider: 'google',
        hasPassword: false,
        userType: 'candidate',
        profile: {
          profilePhoto: picture || ""
        }
      });
    }

    const token = generateToken(user);
    
    const userResponse = {
      id: user._id,
      _id: user._id,
      userName: user.userName,
      fullname: user.fullname,
      email: user.email,
      userType: user.userType,
      role: user.userType,
      profile: user.profile,
      authProvider: user.authProvider,
      hasPassword: user.hasPassword,
      createdAt: user.createdAt,
    };

    res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: true }).json({
      message: `Welcome ${userResponse.fullname}`,
      user: userResponse,
      token,
      success: true
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Google authentication failed", success: false, error: error.message });
  }
};

// ==================== SET PASSWORD (For OAuth users) ====================
exports.setPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const userId = req.user.id;

  if (!password || !confirmPassword) {
    return res.status(400).json({ message: "Password and confirmation are required", success: false });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match", success: false });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters", success: false });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    if (user.hasPassword) {
      return res.status(400).json({ message: "Password already set. Use Change Password instead.", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.hasPassword = true;
    await user.save();

    res.status(200).json({ message: "Password set successfully", success: true });
  } catch (error) {
    console.error("Set password error:", error);
    res.status(500).json({ message: "Failed to set password", success: false });
  }
};

// ==================== CHANGE PASSWORD ====================
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required", success: false });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "New passwords do not match", success: false });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters", success: false });
  }

  try {
    const user = await User.findById(userId).select("+password");
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    if (!user.hasPassword) {
      return res.status(400).json({ message: "No password set. Use Set Password instead.", success: false });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password", success: false });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully", success: true });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to change password", success: false });
  }
};
