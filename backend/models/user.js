//backend\models\user.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "userName is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      index: true,
    },
    hasPassword: {
      type: Boolean,
      default: true,
    },
    fullname: {
      type: String,
      required: false // Optional for backward compatibility with old signup
    },
    phoneNumber: {
      type: Number,
      required: false
    },
    userType: {
      type: String,
      enum: ["candidate", "recruiter", "admin"],
      default: "candidate",
    },
    profile:{
        bio:{type:String},
        skills:[{type:String}],
        resume:{type:String}, // URL to resume file
        resumeOriginalName:{type:String},
        company:{type:mongoose.Schema.Types.ObjectId, ref:'Company'}, 
        profilePhoto:{
            type:String,
            default:""
        }
    },
    company:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Company',
        index: true
    },
    rating: {
      type: Number,
      default: 1000,
      index: true,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for query-based relationships to prevent MongoDB 16MB document limit
userSchema.virtual('report', {
    ref: "Report",
    localField: '_id',
    foreignField: 'candidateId'
}).get(function(val) {
    return val || [];
});

module.exports = mongoose.model("User", userSchema);