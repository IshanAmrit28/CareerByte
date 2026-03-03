// frontend/src/Pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authServices";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login(formData);
      // loginUser receives the user object returned by the backend
      loginUser(response.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.error || err.response?.data?.message || "Invalid credentials. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 font-sans min-w-[1024px]">
      <div className="flex flex-row items-center bg-black rounded-3xl overflow-hidden shadow-2xl max-w-6xl w-full border border-gray-800">
        {/* Left Form Section */}
        <div className="w-1/2 flex flex-col justify-center px-16 py-16 items-center">
          <h1 className="text-4xl font-semibold mb-10 text-center">Login</h1>

          {error && (
            <div className="w-full max-w-md mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-md">
            {/* Email */}
            <div className="flex flex-col mb-6 w-full">
              <label
                htmlFor="email"
                className="text-base font-medium mb-2 text-gray-300"
              >
                Email
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="text-gray-500 w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-3 w-full rounded-lg bg-[#1a1a1a] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col mb-8 w-full">
              <label
                htmlFor="password"
                className="text-base font-medium mb-2 text-gray-300"
              >
                Password
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="text-gray-500 w-5 h-5" />
                </div>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-3 w-full rounded-lg bg-[#1a1a1a] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#f8e8b6] text-black font-bold text-lg py-3 rounded-lg hover:bg-[#f6de96] hover:scale-[1.01] transition-all duration-200 w-full shadow-lg"
            >
              Login
            </button>
          </form>

          <div className="mt-8 text-sm text-gray-400 text-center w-full max-w-md">
            <p>
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Image Section */}
        <div className="w-1/2 bg-[#d3c5a6] rounded-3xl overflow-hidden h-[600px] relative flex items-center justify-center m-4 ml-0">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="AI Interview Illustration"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 opacity-80"
            />
          </div>
          <div className="absolute bottom-8 left-8 right-8 bg-white/80 text-black rounded-2xl p-6 backdrop-blur-md shadow-lg border border-white/50">
            <h2 className="text-xl font-bold mb-2">AI-Powered Interviewer</h2>
            <p className="text-sm leading-relaxed text-gray-800 font-medium">
              Transform recruitment with our cutting-edge AI Interviewer
              platform—designed to analyze resumes intelligently and conduct
              personalized virtual interviews.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
