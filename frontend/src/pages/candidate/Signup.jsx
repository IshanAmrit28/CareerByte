// frontend/src/Pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../../services/authServices";
import { Mail, Lock, User } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "candidate",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    // Note: using e.target.name to match the state keys
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const payload = {
        userName: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userType: formData.userType, // Use state value
      };

      await signup(payload);
      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.error || err.response?.data?.message || "Signup failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4 font-sans py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-black rounded-3xl overflow-hidden shadow-2xl max-w-6xl w-full border border-gray-800">
        
        {/* Left Form Section */}
        <div className="flex flex-col justify-center px-6 md:px-16 py-10 md:py-12 items-center">
          <h1 className="text-4xl font-semibold mb-8 text-center">Create Account</h1>

          {error && (
            <div className="w-full max-w-md mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col w-full">
              <label className="text-base font-medium mb-2 text-gray-300">Full Name</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="text-gray-500 w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-2.5 w-full rounded-lg bg-[#1a1a1a] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col w-full">
              <label className="text-base font-medium mb-2 text-gray-300">Email</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="text-gray-500 w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-2.5 w-full rounded-lg bg-[#1a1a1a] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col w-full">
              <label className="text-base font-medium mb-2 text-gray-300">Password</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="text-gray-500 w-5 h-5" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-2.5 w-full rounded-lg bg-[#1a1a1a] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col w-full">
              <label className="text-base font-medium mb-2 text-gray-300">Confirm Password</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="text-gray-500 w-5 h-5" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-2.5 w-full rounded-lg bg-[#1a1a1a] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Role Selection - Disabled for candidate signup portal */}
            {/* <div className="flex items-center justify-around bg-[#1a1a1a] p-3 rounded-lg border border-gray-800 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="candidate"
                  checked={formData.role === "candidate"}
                  onChange={handleChange}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-300">Candidate</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="recruiter"
                  checked={formData.role === "recruiter"}
                  onChange={handleChange}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-300">Recruiter</span>
              </label>
            </div> */}

            {/* Hidden userType field */}
            <input type="hidden" name="userType" value="candidate" />

            <button
              type="submit"
              className="bg-[#f8e8b6] text-black font-bold text-lg py-3 rounded-lg hover:bg-[#f6de96] hover:scale-[1.01] transition-all duration-200 w-full shadow-lg mt-4"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-8 text-sm text-gray-400 text-center w-full max-w-md">
            <p>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* Right Image Section */}
        <div className="hidden md:flex p-4">
          <div className="w-full h-full bg-[#d3c5a6] rounded-2xl overflow-hidden relative flex items-center justify-center min-h-[600px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="AI Interview Illustration"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 opacity-80"
            />
          </div>
          <div className="absolute bottom-8 left-8 right-8 bg-[#111b27]/80 text-white rounded-2xl p-6 backdrop-blur-md shadow-lg border border-slate-700/50">
            <h2 className="text-xl font-bold mb-2">One Stop Career Prep</h2>
            <p className="text-sm leading-relaxed text-gray-200 font-medium">
              Level up your career with CareerByte. Experience a new way 
              of preparing where AI helps bridge the gap between your 
              potential and your dream role.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default Signup;